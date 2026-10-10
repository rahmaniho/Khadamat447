import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { roleHasPermission, ROLES, type Permission } from "@/lib/constants";
import { AdminNav, type AdminNavLink } from "@/components/admin/admin-nav";
import { loadSite } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false, nocache: true },
};

const LINKS: Array<{ href: string; label: string; icon: AdminNavLink["icon"]; perm: Permission }> = [
  { href: "/admin", label: "داشبورد", icon: "home", perm: "dashboard.view" },
  { href: "/admin/requests", label: "درخواست‌ها", icon: "clipboard", perm: "requests.view" },
  { href: "/admin/content/services", label: "خدمات", icon: "services", perm: "content.services" },
  { href: "/admin/content/faqs", label: "سؤالات متداول", icon: "chat", perm: "content.faqs" },
  { href: "/admin/content/articles", label: "مقالات", icon: "badge", perm: "content.articles" },
  { href: "/admin/content/announcements", label: "اطلاعیه‌ها", icon: "shield", perm: "content.announcements" },
  { href: "/admin/content/settings", label: "تنظیمات سایت", icon: "shield", perm: "content.settings" },
  { href: "/admin/notifications", label: "اعلان‌ها", icon: "mail", perm: "notifications.view" },
  { href: "/admin/users", label: "کاربران مدیر", icon: "lock", perm: "users.manage" },
  { href: "/admin/logs", label: "سابقه رویدادها", icon: "track", perm: "logs.view" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  await loadSite();
  // صفحه ورود بدون منو نمایش داده می‌شود
  if (!user) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }
  const links: AdminNavLink[] = LINKS.filter((l) => roleHasPermission(user.role, l.perm)).map(({ href, label, icon }) => ({ href, label, icon }));
  links.push({ href: "/admin/account", label: "حساب کاربری و رمز عبور", icon: "lock" });
  const roleLabel = ROLES[user.role]?.label ?? user.role;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <AdminNav links={links} userName={user.name} roleLabel={roleLabel} />
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
