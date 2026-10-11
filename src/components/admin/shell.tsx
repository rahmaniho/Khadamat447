"use client";

/**
 * پوسته پیشخوان مدیریت
 * ---------------------------------------------------------------
 * نوار کناری با گروه‌بندی بخش‌ها، سربرگ با جست‌وجو و منوی کاربر،
 * و کنترل دسترسی بر اساس نقش. در نبود نشست، فرم ورود نمایش داده
 * می‌شود تا نسخه نمایشی بدون تنظیمات سرور هم قابل بررسی باشد.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Avatar, Badge, Button, ButtonLink, Kbd } from "@/components/ui/primitives";
import { ConfirmDialog, Tooltip } from "@/components/ui/overlay";
import { AdminLogin } from "@/components/admin/login";
import { useStore, type Permission } from "@/lib/store/store";
import { ROLE_META } from "@/lib/store/types";
import { cn } from "@/lib/cn";
import { DEMO_CREDENTIALS } from "@/lib/store/seed";
import { toFaDigits } from "@/lib/digits";
import { timeAgo } from "@/lib/format";

interface NavGroup {
  title: string;
  items: Array<{ href: string; label: string; icon: string; permission?: Permission; badge?: "queue" | "needsInfo" }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "مرور کلی",
    items: [{ href: "/admin", label: "داشبورد", icon: "chart", permission: "dashboard.view" }],
  },
  {
    title: "درخواست‌ها",
    items: [
      { href: "/admin/requests", label: "فهرست درخواست‌ها", icon: "inbox", permission: "requests.view", badge: "needsInfo" },
    ],
  },
  {
    title: "محتوا",
    items: [
      { href: "/admin/services", label: "خدمات", icon: "services", permission: "content.manage" },
      { href: "/admin/faqs", label: "پرسش‌های متداول", icon: "chat", permission: "content.manage" },
      { href: "/admin/articles", label: "مقالات و راهنماها", icon: "book", permission: "content.manage" },
      { href: "/admin/announcements", label: "اطلاعیه‌ها", icon: "bell", permission: "content.manage" },
    ],
  },
  {
    title: "ارتباطات",
    items: [
      { href: "/admin/notifications", label: "صف اعلان‌ها", icon: "send", permission: "notifications.manage", badge: "queue" },
    ],
  },
  {
    title: "مدیریت سامانه",
    items: [
      { href: "/admin/users", label: "کاربران و نقش‌ها", icon: "users", permission: "users.manage" },
      { href: "/admin/audit", label: "سابقه رویدادها", icon: "archive", permission: "logs.view" },
      { href: "/admin/settings", label: "تنظیمات", icon: "gear", permission: "settings.manage" },
      { href: "/admin/account", label: "حساب من", icon: "user" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, can, logout, stats, toast, resetDemo, ready, activeAnnouncements } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenu(false);
  }, [pathname]);

  /* گیت ورود */
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--page-bg)]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm font-bold text-ink-500 dark:text-ink-400">در حال بارگذاری پیشخوان…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin />;
  }

  const badgeValue = (badge?: string) => {
    if (badge === "queue") return stats.queuedNotifications;
    if (badge === "needsInfo") return stats.byStatus.needs_info;
    return undefined;
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-[var(--page-bg)]">
      {/* نمایش نسخه نمایشی */}
      <div className="no-print flex flex-wrap items-center justify-center gap-2 bg-gradient-to-l from-gold-600 via-gold-500 to-gold-400 px-4 py-2 text-center text-[0.72rem] font-black text-white">
        <Icon name="sparkles" size={14} />
        نسخه نمایشی پیشخوان — داده‌ها در مرورگر شما ذخیره می‌شود.
        <span className="rounded-lg bg-white/20 px-2 py-0.5" dir="ltr">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </span>
        <button type="button" onClick={() => setConfirmReset(true)} className="underline underline-offset-4">
          بازنشانی داده‌ها
        </button>
      </div>

      <div className="flex">
        {/* نوار کناری */}
        <aside
          className={cn(
            "no-print fixed inset-y-0 end-0 z-50 w-72 overflow-y-auto border-s border-[var(--border-soft)] bg-[var(--surface)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4">
            <Link href="/admin">
              <Logo size={38} />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 lg:hidden dark:hover:bg-white/10"
              aria-label="بستن منو"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <nav className="space-y-5 p-3">
            {NAV_GROUPS.map((group) => {
              const items = group.items.filter((item) => !item.permission || can(item.permission));
              if (items.length === 0) return null;
              return (
                <div key={group.title}>
                  <p className="px-3 text-[0.62rem] font-black tracking-wide text-ink-400 dark:text-ink-500">{group.title}</p>
                  <ul className="mt-2 space-y-1">
                    {items.map((item) => {
                      const count = badgeValue(item.badge);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.8rem] font-bold transition-all",
                              isActive(item.href)
                                ? "bg-brand-600 text-white shadow-[0_10px_24px_-14px_rgba(30,122,113,.9)]"
                                : "text-ink-600 hover:bg-brand-50 hover:text-brand-800 dark:text-ink-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-200",
                            )}
                          >
                            <Icon name={item.icon} size={18} />
                            <span className="flex-1">{item.label}</span>
                            {typeof count === "number" && count > 0 && (
                              <span
                                className={cn(
                                  "numeric rounded-full px-1.5 text-[0.62rem]",
                                  isActive(item.href) ? "bg-white/25" : "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200",
                                )}
                              >
                                {toFaDigits(count)}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="m-3 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 p-4">
            <p className="flex items-center gap-2 text-[0.72rem] font-black text-ink-800 dark:text-ink-100">
              <Icon name="globe" size={15} className="text-brand-600 dark:text-brand-400" />
              نمایش سایت عمومی
            </p>
            <div className="mt-3 space-y-2">
              <ButtonLink href="/" size="sm" variant="outline" icon="home" full>
                صفحه اصلی سایت
              </ButtonLink>
              <ButtonLink href="/request" size="sm" variant="ghost" icon="send" full>
                فرم ثبت درخواست
              </ButtonLink>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
        )}

        {/* ناحیه اصلی */}
        <div className="min-w-0 flex-1">
          <header className="glass sticky top-0 z-30 border-b border-[var(--border-soft)]">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] text-ink-600 lg:hidden dark:text-ink-300"
                aria-label="باز کردن منو"
              >
                <Icon name="menu" size={18} />
              </button>

              <div className="hidden flex-1 items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-2.5 text-[0.78rem] font-bold text-ink-400 md:flex">
                <Icon name="search" size={16} />
                جست‌وجوی سراسری
                <Kbd>⌘K</Kbd>
              </div>

              <div className="ms-auto flex items-center gap-2">
                {activeAnnouncements.length > 0 && (
                  <Tooltip content={activeAnnouncements.map((a) => a.title).join(" • ")}>
                    <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-brand-600 dark:text-brand-300">
                      <Icon name="bell" size={18} />
                    </span>
                  </Tooltip>
                )}

                <Tooltip content="درخواست‌های نیازمند تکمیل">
                  <Link
                    href="/admin/requests?status=needs_info"
                    className="relative grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-ink-600 transition hover:text-brand-700 dark:text-ink-300"
                  >
                    <Icon name="inbox" size={18} />
                    {stats.byStatus.needs_info > 0 && (
                      <span className="absolute -top-1 -start-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[0.62rem] font-black text-white">
                        {toFaDigits(stats.byStatus.needs_info)}
                      </span>
                    )}
                  </Link>
                </Tooltip>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenu((v) => !v)}
                    aria-expanded={userMenu}
                    className="flex items-center gap-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-2.5 py-2 transition hover:border-brand-300"
                  >
                    <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
                    <span className="hidden text-start sm:block">
                      <span className="block text-[0.74rem] font-black text-ink-900 dark:text-white">{currentUser.name}</span>
                      <span className="block text-[0.62rem] font-bold text-ink-500 dark:text-ink-400">
                        {role ? ROLE_META[role].label : ""}
                      </span>
                    </span>
                    <Icon name="chevronDown" size={15} className={cn("text-ink-400 transition", userMenu && "rotate-180")} />
                  </button>

                  {userMenu && (
                    <div className="absolute end-0 top-full z-50 mt-2 w-64 animate-scale-in rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 shadow-2xl">
                      <div className="rounded-2xl bg-[var(--surface-muted)] p-3">
                        <p className="text-[0.8rem] font-black text-ink-900 dark:text-white">{currentUser.name}</p>
                        <p className="mt-0.5 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                          {currentUser.email}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
                          <Icon name="clock" size={12} />
                          آخرین ورود: {timeAgo(currentUser.lastLoginAt)}
                        </p>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        <li>
                          <Link
                            href="/admin/account"
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[0.78rem] font-bold text-ink-700 transition hover:bg-brand-50 dark:text-ink-200 dark:hover:bg-brand-500/10"
                          >
                            <Icon name="user" size={16} />
                            حساب کاربری
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/"
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[0.78rem] font-bold text-ink-700 transition hover:bg-brand-50 dark:text-ink-200 dark:hover:bg-brand-500/10"
                          >
                            <Icon name="globe" size={16} />
                            بازگشت به سایت
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              toast.info("از حساب خارج شدید");
                              router.push("/admin");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[0.78rem] font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          >
                            <Icon name="logout" size={16} />
                            خروج از حساب
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          router.refresh();
        }}
        title="بازنشانی داده‌های نمایشی"
        description="همه تغییرات شما در درخواست‌ها، محتوا، کاربران و تنظیمات حذف می‌شود و داده‌های نمونه بازگردانده می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، بازنشانی کن"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * اجزای کمکی صفحات پیشخوان
 * ------------------------------------------------------------------ */

export function AdminPageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  icon?: string;
  breadcrumbs?: Array<{ name: string; href: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      {breadcrumbs && (
        <nav aria-label="مسیر صفحه" className="mb-3">
          <ol className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            <li>
              <Link href="/admin" className="transition hover:text-brand-700 dark:hover:text-brand-300">
                پیشخوان
              </Link>
            </li>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Icon name="chevronLeft" size={12} className="text-ink-300" />
                <Link href={crumb.href} className="transition hover:text-brand-700 dark:hover:text-brand-300">
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-glow">
              <Icon name={icon} size={23} />
            </span>
          )}
          <div>
            <h1 className="text-xl font-black text-ink-900 dark:text-white">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function PermissionNotice({ permission }: { permission: string }) {
  return (
    <div className="surface-card mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
        <Icon name="lock" size={26} />
      </span>
      <h2 className="mt-4 text-lg font-black text-ink-900 dark:text-white">دسترسی لازم را ندارید</h2>
      <p className="mt-2 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
        نقش کاربری شما اجازه دسترسی به این بخش ({permission}) را ندارد. برای تغییر سطح دسترسی با مدیر کل تماس بگیرید.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <ButtonLink href="/admin" size="sm" icon="chart">
          بازگشت به داشبورد
        </ButtonLink>
        <ButtonLink href="/admin/account" size="sm" variant="outline" icon="user">
          حساب من
        </ButtonLink>
      </div>
    </div>
  );
}

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("surface-card mb-5 flex flex-wrap items-center gap-3 p-4", className)}>{children}</div>
  );
}

export function StatusPill({ status, tone }: { status: string; tone: string }) {
  return <Badge tone={tone} dot>{status}</Badge>;
}

export function TableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("surface-card overflow-hidden p-0", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  total,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  total: number;
}) {
  if (pageCount <= 1) {
    return (
      <p className="mt-4 text-center text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
        مجموع {toFaDigits(total)} مورد
      </p>
    );
  }
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
        مجموع {toFaDigits(total)} مورد — صفحه {toFaDigits(page)} از {toFaDigits(pageCount)}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" icon="chevronRight" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconEnd="chevronLeft"
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
