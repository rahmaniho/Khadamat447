"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: "home" | "clipboard" | "services" | "chat" | "mail" | "lock" | "track" | "badge" | "shield";
}

export function AdminNav({ links, userName, roleLabel }: { links: AdminNavLink[]; userName: string; roleLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const Items = (
    <nav aria-label="منوی پنل مدیریت" className="space-y-1">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              active ? "bg-brand-700 text-white" : "text-slate-700 hover:bg-brand-50"
            }`}
          >
            <Icon name={l.icon as never} size={18} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <p className="font-extrabold text-brand-900">پنل مدیریت</p>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">
          {open ? "بستن" : "منو"}
        </button>
      </div>
      {open && <div className="border-b border-slate-200 bg-white p-3 lg:hidden">{Items}</div>}
      <aside className="hidden w-64 shrink-0 flex-col border-l border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="border-b border-slate-200 p-5">
          <p className="font-black text-brand-900">پنل مدیریت</p>
          <p className="mt-1 text-xs text-slate-500">دفتر خدمات سلامت ۴۷۷</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{Items}</div>
        <div className="border-t border-slate-200 p-4 text-sm">
          <p className="font-bold">{userName}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
          <form action="/admin/logout" method="post" className="mt-3">
            <button type="submit" className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-700 hover:bg-slate-50">خروج از حساب</button>
          </form>
        </div>
      </aside>
    </>
  );
}
