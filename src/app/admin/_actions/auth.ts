"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { all, get, run, nowIso } from "@/lib/db";
import { verifyPassword, hashPassword, passwordIssues } from "@/lib/auth/password";
import { createSession, destroySession, SESSION_COOKIE, sessionCookieOptions, getSessionUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/ratelimit";
import { logSecurity } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import { newId } from "@/lib/utils";
import { clientIp, clientUserAgent, ipHash } from "@/lib/requests";
import { ensureBootstrap } from "@/lib/bootstrap";
import { flashPath } from "@/lib/admin-flash";

const FAIL_WINDOW_MIN = 15;
const FAIL_LIMIT = 5;
const DUMMY_HASH = "scrypt:16384:8:1:00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export type LoginState = { ok: false; error: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  await ensureBootstrap();
  const ip = await clientIp();
  const email = String(formData.get("email") || "").trim().toLowerCase().slice(0, 160);
  const password = String(formData.get("password") || "").slice(0, 200);
  const generic = "ورود ناموفق بود. ایمیل یا رمز عبور نادرست است، یا ورود موقتاً محدود شده است.";

  const rl = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: "تلاش‌های ورود زیاد است. چند دقیقه بعد دوباره امتحان کنید." };

  const user = email
    ? await get<{ id: string; name: string; email: string; role: string; password_hash: string; active: number; must_change_password: number }>(
        "SELECT id, name, email, role, password_hash, active, must_change_password FROM users WHERE email = ?",
        [email],
      )
    : undefined;

  // محدودیت تلاش ناموفق برای هر حساب
  const since = new Date(Date.now() - FAIL_WINDOW_MIN * 60 * 1000).toISOString();
  const failures = email
    ? await get<{ c: number }>("SELECT COUNT(*) AS c FROM login_attempts WHERE identifier = ? AND success = 0 AND created_at >= ?", [email, since])
    : undefined;
  const locked = Number(failures?.c || 0) >= FAIL_LIMIT;

  const ok = !locked && (await verifyPassword(password, user?.password_hash || DUMMY_HASH)) && !!user && Boolean(user.active);

  await run("INSERT INTO login_attempts (id, identifier, ip, success, created_at) VALUES (?,?,?,?,?)", [
    newId(), email, ipHash(ip), ok ? 1 : 0, nowIso(),
  ]);

  if (!ok || !user) {
    logSecurity("ورود ناموفق مدیر", { email_hash: ipHash(email), ip: ipHash(ip), locked });
    return { ok: false, error: generic };
  }

  await run("UPDATE users SET last_login_at = ?, failed_attempts = 0 WHERE id = ?", [nowIso(), user.id]);
  const token = await createSession(
    { id: user.id, name: user.name, email: user.email, role: user.role as "owner" | "reviewer" | "content", mustChangePassword: Boolean(user.must_change_password) },
    { ip: ipHash(ip), userAgent: await clientUserAgent() },
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  await logAudit({ id: user.id, name: user.name, role: user.role }, "auth.login", { type: "user", id: user.id }, {}, ipHash(ip));
  redirect(user.must_change_password ? "/admin/account" : "/admin");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user) await logAudit({ id: user.id, name: user.name, role: user.role }, "auth.logout", { type: "user", id: user.id });
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  const row = await get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    redirect(flashPath("/admin/account", "رمز عبور فعلی نادرست است.", "err"));
  }
  if (next !== confirm) redirect(flashPath("/admin/account", "تکرار رمز عبور جدید یکسان نیست.", "err"));
  const issues = passwordIssues(next);
  if (issues.length) redirect(flashPath("/admin/account", issues.join(" "), "err"));
  if (next === current) redirect(flashPath("/admin/account", "رمز جدید باید با رمز قبلی متفاوت باشد.", "err"));

  await run("UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?", [
    await hashPassword(next), nowIso(), user.id,
  ]);
  // خروج از سایر نشست‌ها
  const sessions = await all<{ id: string }>("SELECT id FROM sessions WHERE user_id = ? AND revoked_at IS NULL", [user.id]);
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value || "";
  const currentSessionId = raw.split(".")[0];
  for (const s of sessions) {
    if (s.id !== currentSessionId) await run("UPDATE sessions SET revoked_at = ? WHERE id = ?", [nowIso(), s.id]);
  }
  await logAudit({ id: user.id, name: user.name, role: user.role }, "auth.password_changed", { type: "user", id: user.id });
  redirect(flashPath("/admin/account", "رمز عبور با موفقیت تغییر کرد.", "ok"));
}

