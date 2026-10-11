"use client";

/**
 * سربرگ سایت
 * ---------------------------------------------------------------
 * نوار بالایی اطلاعات سریع، منوی اصلی با زیرمنوی خدمات، جست‌وجوی
 * سراسری، تغییر حالت روشن/تاریک و منوی موبایل.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Badge, ButtonLink, Kbd } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/layout/theme-provider";
import { CommandPalette } from "@/components/layout/command-palette";
import { NAV, SITE } from "@/lib/content/site";
import { cn } from "@/lib/cn";
import { toFaDigits } from "@/lib/digits";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* نوار اطلاعات سریع */}
      <div className="hidden bg-brand-900 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 text-[0.72rem] font-bold">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={14} className="text-brand-300" />
              {SITE.hoursSummary}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="pin" size={14} className="text-brand-300" />
              {SITE.address}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${SITE.phones[0].value}`} className="flex items-center gap-1.5 transition hover:text-brand-200">
              <Icon name="phone" size={14} className="text-brand-300" />
              <span className="numeric">{toFaDigits(SITE.phones[0].display)}</span>
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-1.5 transition hover:text-brand-200">
              <Icon name="mail" size={14} className="text-brand-300" />
              {SITE.emailDisplay}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-400",
          scrolled
            ? "glass border-[var(--border-soft)] shadow-[0_8px_30px_-20px_rgba(16,26,28,.5)]"
            : "border-transparent bg-[var(--page-bg)]",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="shrink-0" aria-label="صفحه اصلی دفتر خدمات سلامت ۴۷۷">
            <Logo size={40} />
          </Link>

          {/* ناوبری دسکتاپ */}
          <nav className="mx-auto hidden items-center gap-0.5 lg:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) =>
              item.children ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setMegaOpen((v) => !v)}
                    aria-expanded={megaOpen}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[0.83rem] font-bold transition-all duration-250",
                      isActive(item.href) || megaOpen
                        ? "bg-brand-50 text-brand-800 dark:bg-brand-500/12 dark:text-brand-200"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/8 dark:hover:text-white",
                    )}
                  >
                    {item.label}
                    <Icon name="chevronDown" size={14} className={cn("transition-transform duration-300", megaOpen && "rotate-180")} />
                  </button>

                  {megaOpen && (
                    <div className="absolute start-1/2 top-full z-50 w-[30rem] -translate-x-1/2 pt-2 rtl:translate-x-1/2">
                      <div className="animate-scale-in overflow-hidden rounded-4xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 shadow-2xl">
                        <ul className="grid gap-1 sm:grid-cols-2">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
                              >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
                                  <Icon name={child.icon ?? "dot"} size={19} />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-[0.84rem] font-black text-ink-900 dark:text-white">{child.label}</span>
                                  {child.description && (
                                    <span className="mt-0.5 block text-[0.7rem] leading-6 text-ink-500 dark:text-ink-400">
                                      {child.description}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-1 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 px-4 py-3 text-white">
                          <span className="text-[0.74rem] font-bold">
                            فرم اختصاصی هر خدمت، با کد پیگیری و امکان بارگذاری مدارک
                          </span>
                          <Link
                            href="/request"
                            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white/15 px-3 py-1.5 text-[0.72rem] font-black backdrop-blur transition hover:bg-white/25"
                          >
                            ثبت درخواست
                            <Icon name="arrowLeft" size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[0.83rem] font-bold transition-all duration-250",
                    isActive(item.href)
                      ? "bg-brand-50 text-brand-800 dark:bg-brand-500/12 dark:text-brand-200"
                      : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/8 dark:hover:text-white",
                  )}
                >
                  {item.label}
                  {item.badge && <Badge tone="gold" size="sm">{item.badge}</Badge>}
                </Link>
              ),
            )}
          </nav>

          {/* اقدام‌ها */}
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-2.5 text-[0.78rem] font-bold text-ink-500 transition hover:border-brand-300 hover:text-brand-700 md:inline-flex dark:text-ink-400 dark:hover:border-brand-400/40 dark:hover:text-brand-200"
            >
              <Icon name="search" size={16} />
              جست‌وجو
              <Kbd>⌘K</Kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 md:hidden dark:text-ink-300"
              aria-label="جست‌وجو"
            >
              <Icon name="search" size={18} />
            </button>
            <ThemeToggle />
            <ButtonLink href="/track" variant="outline" size="sm" icon="track" className="hidden xl:inline-flex">
              پیگیری
            </ButtonLink>
            <ButtonLink href="/request" size="sm" icon="send" className="hidden sm:inline-flex">
              ثبت درخواست
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpenMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-ink-700 lg:hidden dark:text-ink-200"
              aria-label="باز کردن منو"
              aria-expanded={openMenu}
            >
              <Icon name="menu" size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* منوی موبایل */}
      {openMenu && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="منوی موبایل">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpenMenu(false)} aria-hidden />
          <div className="absolute inset-y-0 end-0 w-[min(92vw,22rem)] animate-scale-in overflow-y-auto border-s border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4">
              <Logo size={36} />
              <button
                type="button"
                onClick={() => setOpenMenu(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                aria-label="بستن منو"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <nav className="p-3">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition",
                        isActive(item.href)
                          ? "bg-brand-50 text-brand-800 dark:bg-brand-500/12 dark:text-brand-200"
                          : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/8",
                      )}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--surface-muted)] text-brand-700 dark:text-brand-300">
                        <Icon name={item.icon ?? "dot"} size={18} />
                      </span>
                      {item.label}
                      <Icon name="chevronLeft" size={16} className="ms-auto text-ink-300" />
                    </Link>
                    {item.children && (
                      <ul className="mt-1 space-y-0.5 ps-12">
                        {item.children.slice(1).map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-xl px-2 py-2 text-[0.78rem] font-bold text-ink-500 transition hover:text-brand-700 dark:text-ink-400 dark:hover:text-brand-200"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 rounded-3xl bg-[var(--surface-muted)] p-4">
                <ButtonLink href="/request" full icon="send" size="sm">
                  ثبت درخواست آنلاین
                </ButtonLink>
                <ButtonLink href="/track" full variant="outline" icon="track" size="sm">
                  پیگیری درخواست
                </ButtonLink>
                <ButtonLink href="/admin" full variant="ghost" icon="shield" size="sm">
                  پیشخوان مدیریت (نمایشی)
                </ButtonLink>
              </div>

              <div className="mt-4 space-y-2 rounded-3xl border border-[var(--border-soft)] p-4 text-[0.76rem] font-bold text-ink-600 dark:text-ink-300">
                <a href={`tel:${SITE.phones[0].value}`} className="flex items-center gap-2">
                  <Icon name="phone" size={15} className="text-brand-600" />
                  <span className="numeric">{toFaDigits(SITE.phones[0].display)}</span>
                </a>
                <a href={`tel:${SITE.phones[1].value}`} className="flex items-center gap-2">
                  <Icon name="phone" size={15} className="text-brand-600" />
                  <span className="numeric">{toFaDigits(SITE.phones[1].display)}</span>
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2">
                  <Icon name="mail" size={15} className="text-brand-600" />
                  {SITE.emailDisplay}
                </a>
                <p className="flex items-start gap-2 leading-7">
                  <Icon name="pin" size={15} className="mt-1 shrink-0 text-brand-600" />
                  {SITE.addressFull}
                </p>
              </div>
            </nav>
          </div>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
