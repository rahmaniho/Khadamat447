/** کنترل دسترسی مبتنی بر نقش */
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { roleHasPermission, type Permission } from "@/lib/constants";
import { logSecurity } from "@/lib/logger";

export async function currentUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/**
 * الزام ورود. اگر کاربر باید رمز خود را تغییر دهد، به صفحه حساب هدایت می‌شود
 * (مگر allowPasswordChange باشد).
 */
export async function requireUser(opts: { allowPasswordChange?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !opts.allowPasswordChange) {
    redirect("/admin/account?err=" + encodeURIComponent("پیش از ادامه، رمز عبور خود را تغییر دهید."));
  }
  return user;
}

/** الزام مجوز مشخص؛ در صورت نداشتن مجوز، خطای دسترسی */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!roleHasPermission(user.role, permission)) {
    logSecurity("تلاش برای دسترسی بدون مجوز", { user: user.email, permission });
    redirect("/admin/forbidden");
  }
  return user;
}

/** برای Route Handler ها: بدون redirect، فقط بررسی مجوز */
export async function checkPermission(permission: Permission): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.mustChangePassword) return null;
  return roleHasPermission(user.role, permission) ? user : null;
}
