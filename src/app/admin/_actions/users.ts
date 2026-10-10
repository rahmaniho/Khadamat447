"use server";

import { redirect } from "next/navigation";
import { get, run, nowIso } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { hashPassword, passwordIssues } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";
import { flashPath } from "@/lib/admin-flash";
import { createUser } from "@/lib/queries";
import { ROLE_KEYS, type Role } from "@/lib/constants";
import { isEmail } from "@/lib/validation";
import { cleanText } from "@/lib/validation";

const actor = (u: { id: string; name: string; role: string }) => ({ id: u.id, name: u.name, role: u.role });

export async function createUserAction(formData: FormData): Promise<void> {
  const me = await requirePermission("users.manage");
  const name = cleanText(formData.get("name") || "", 120);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "");
  const password = String(formData.get("password") || "");
  if (name.length < 2) redirect(flashPath("/admin/users", "نام کاربر را وارد کنید.", "err"));
  if (!isEmail(email)) redirect(flashPath("/admin/users", "ایمیل معتبر نیست.", "err"));
  if (!ROLE_KEYS.includes(role as Role)) redirect(flashPath("/admin/users", "نقش نامعتبر است.", "err"));
  const issues = passwordIssues(password);
  if (issues.length) redirect(flashPath("/admin/users", issues.join(" "), "err"));
  if (await get("SELECT id FROM users WHERE email = ?", [email])) redirect(flashPath("/admin/users", "این ایمیل قبلاً ثبت شده است.", "err"));
  const id = await createUser({ name, email, passwordHash: await hashPassword(password), role });
  await logAudit(actor(me), "user.created", { type: "user", id }, { role });
  redirect(flashPath("/admin/users", "کاربر ایجاد شد. در ورود اول باید رمز خود را تغییر دهد."));
}

/** تغییر نقش، یا فعال/غیرفعال‌سازی (با toggleActive). غیرفعال‌سازی، نشست‌ها را می‌بندد. */
export async function updateUserAction(formData: FormData): Promise<void> {
  const me = await requirePermission("users.manage");
  const id = String(formData.get("id") || "");
  const target = await get<{ id: string; name: string; role: string; active: number }>("SELECT id, name, role, active FROM users WHERE id = ?", [id]);
  if (!target) redirect(flashPath("/admin/users", "کاربر یافت نشد.", "err"));
  if (target.id === me.id && formData.get("toggleActive")) redirect(flashPath("/admin/users", "امکان غیرفعال‌کردن حساب خودتان وجود ندارد.", "err"));

  if (formData.get("toggleActive")) {
    const nextActive = target.active ? 0 : 1;
    await run("UPDATE users SET active = ?, updated_at = ? WHERE id = ?", [nextActive, nowIso(), id]);
    if (!nextActive) await run("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL", [nowIso(), id]);
    await logAudit(actor(me), nextActive ? "user.activated" : "user.deactivated", { type: "user", id }, { name: target.name });
    redirect(flashPath("/admin/users", nextActive ? "کاربر فعال شد." : "کاربر غیرفعال و نشست‌هایش بسته شد."));
  }

  const role = String(formData.get("role") || "");
  if (!ROLE_KEYS.includes(role as Role)) redirect(flashPath("/admin/users", "نقش نامعتبر است.", "err"));
  if (target.id === me.id && role !== "owner") redirect(flashPath("/admin/users", "نقش مدیر کل خودتان قابل تغییر نیست.", "err"));
  await run("UPDATE users SET role = ?, updated_at = ? WHERE id = ?", [role, nowIso(), id]);
  await run("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL", [nowIso(), id]);
  await logAudit(actor(me), "user.role_changed", { type: "user", id }, { from: target.role, to: role });
  redirect(flashPath("/admin/users", "نقش کاربر به‌روزرسانی شد و نشست‌های فعلی او بسته شدند."));
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const me = await requirePermission("users.manage");
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  const issues = passwordIssues(password);
  if (issues.length) redirect(flashPath("/admin/users", issues.join(" "), "err"));
  const target = await get<{ name: string }>("SELECT name FROM users WHERE id = ?", [id]);
  if (!target) redirect(flashPath("/admin/users", "کاربر یافت نشد.", "err"));
  await run("UPDATE users SET password_hash = ?, must_change_password = 1, updated_at = ? WHERE id = ?", [await hashPassword(password), nowIso(), id]);
  await run("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL", [nowIso(), id]);
  await logAudit(actor(me), "user.password_reset", { type: "user", id }, { name: target.name });
  redirect(flashPath("/admin/users", "رمز موقت تنظیم شد؛ کاربر باید در ورود بعدی آن را تغییر دهد."));
}
