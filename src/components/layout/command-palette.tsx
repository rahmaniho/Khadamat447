"use client";

/**
 * جست‌وجوی سراسری (Command Palette)
 * ---------------------------------------------------------------
 * با میان‌بر Ctrl/⌘ + K باز می‌شود و در خدمات، مقالات، پرسش‌ها و
 * صفحات سایت جست‌وجوی فوری انجام می‌دهد. ناوبری با کلیدهای جهت‌دار.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Kbd } from "@/components/ui/primitives";
import { SEARCH_INDEX, type SearchHit } from "@/lib/content";
import { cn } from "@/lib/cn";
import { fa, normalizeFa } from "@/lib/format";

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  service: "خدمت",
  article: "مقاله",
  faq: "پرسش",
  page: "صفحه",
};

const TYPE_TONE: Record<SearchHit["type"], string> = {
  service: "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300",
  article: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/12 dark:text-indigo-300",
  faq: "bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300",
  page: "bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-200",
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = normalizeFa(query);
    if (!q) return SEARCH_INDEX.slice(0, 8);
    const scored = SEARCH_INDEX.map((hit) => {
      const title = normalizeFa(hit.title);
      const body = normalizeFa(`${hit.description} ${hit.keywords}`);
      let score = 0;
      if (title.startsWith(q)) score += 50;
      if (title.includes(q)) score += 30;
      if (body.includes(q)) score += 12;
      if (hit.type === "service") score += 6;
      return { hit, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 12).map((r) => r.hit);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      go(results[cursor].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="جست‌وجوی سراسری">
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl animate-scale-in overflow-hidden rounded-4xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border-soft)] px-5">
          <Icon name="search" size={20} className="text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="جست‌وجو در خدمات، مقالات، پرسش‌ها و راهنماها…"
            className="h-16 flex-1 bg-transparent text-[0.95rem] font-medium text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
            aria-label="عبارت جست‌وجو"
          />
          {query && (
            <span className="numeric shrink-0 rounded-lg bg-brand-50 px-2 py-1 text-[0.7rem] font-bold text-brand-700 dark:bg-brand-500/12 dark:text-brand-200">
              {fa(results.length)} نتیجه
            </span>
          )}
          <Kbd>Esc</Kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400 dark:bg-white/8">
                <Icon name="search" size={26} />
              </span>
              <p className="mt-4 font-black text-ink-900 dark:text-white">نتیجه‌ای یافت نشد</p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                می‌توانید از صفحه <span className="font-bold text-brand-700 dark:text-brand-300">جست‌وجوی پیشرفته</span> استفاده کنید یا عبارت دیگری بنویسید.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((hit, i) => (
                <li key={`${hit.type}-${hit.href}`}>
                  <button
                    type="button"
                    data-index={i}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(hit.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors",
                      cursor === i ? "bg-brand-50 dark:bg-brand-500/12" : "hover:bg-ink-50 dark:hover:bg-white/5",
                    )}
                  >
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TYPE_TONE[hit.type])}>
                      <Icon name={hit.icon} size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-bold text-ink-900 dark:text-white">{hit.title}</span>
                        <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold", TYPE_TONE[hit.type])}>
                          {TYPE_LABEL[hit.type]}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[0.74rem] text-ink-500 dark:text-ink-400">{hit.description}</span>
                    </span>
                    <Icon name="chevronLeft" size={16} className="shrink-0 text-ink-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] bg-[var(--surface-muted)]/60 px-5 py-3 text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> جابه‌جایی
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Enter</Kbd> انتخاب
            </span>
          </span>
          <button
            type="button"
            onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
            className="font-black text-brand-700 hover:underline dark:text-brand-300"
          >
            جست‌وجوی پیشرفته در کل سایت
          </button>
        </div>
      </div>
    </div>
  );
}
