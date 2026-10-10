"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { BrandMark } from "@/components/logo";

export interface NavItem {
  href: string;
  label: string;
}

export function SiteHeader({
  name,
  phone,
  nav,
}: {
  name: string;
  phone: string;
  nav: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${name} - صفحه اصلی`}>
          <BrandMark size={48} priority />
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-brand-900">{name}</span>
            <span className="block text-xs text-slate-500">قزوین</span>
          </span>
        </Link>

        <nav aria-label="منوی اصلی" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-800 ${
                pathname === item.href ? "bg-brand-50 text-brand-800" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/search" aria-label="جست‌وجو در سایت" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-brand-50">
            <Icon name="search" size={20} />
          </Link>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              <Icon name="phone" size={18} /> تماس با دفتر
            </a>
          )}
          <Link
            href="/request"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-700/25 hover:bg-brand-800"
          >
            ثبت درخواست آنلاین
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-800 lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[65px] bottom-0 z-50 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="منوی موبایل" className="flex flex-col gap-1 p-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl px-4 py-4 text-base font-semibold text-slate-800 hover:bg-brand-50"
              >
                {item.label}
                <Icon name="arrowLeft" size={18} className="text-brand-600" />
              </Link>
            ))}
          </nav>
          <div className="grid gap-3 border-t border-slate-100 p-4">
            <Link href="/search" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-800">
              <Icon name="search" size={20} /> جست‌وجو در سایت
            </Link>
            <Link
              href="/request"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-4 text-base font-bold text-white"
            >
              ثبت درخواست آنلاین
            </Link>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 px-4 py-4 text-base font-bold text-brand-800"
              >
                <Icon name="phone" size={20} /> تماس با دفتر
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
