"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Rating } from "@/components/ui/primitives";
import { Avatar } from "@/components/ui/primitives";
import { TESTIMONIALS } from "@/lib/content/site";
import { cn } from "@/lib/cn";

const COLORS = ["#1e7a71", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e"];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), 6500);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const active = TESTIMONIALS[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="surface-card relative overflow-hidden p-7 md:p-9">
        <Icon name="quote" size={64} className="pointer-events-none absolute -top-2 left-6 text-brand-100 dark:text-white/5" />

        <div key={index} className="relative animate-fade-up">
          <Rating value={active.rating} size={18} />
          <p className="mt-5 text-[0.98rem] leading-9 text-ink-700 dark:text-ink-200">«{active.text}»</p>

          <div className="mt-6 flex items-center gap-3 border-t border-[var(--border-soft)] pt-5">
            <Avatar name={active.name} color={COLORS[index % COLORS.length]} />
            <div className="min-w-0">
              <p className="font-black text-ink-900 dark:text-white">{active.name}</p>
              <p className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">{active.role}</p>
            </div>
            <span className="ms-auto rounded-full bg-brand-50 px-3 py-1 text-[0.66rem] font-black text-brand-700 dark:bg-brand-500/12 dark:text-brand-200">
              {active.service}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => go(i)}
              aria-label={`نمایش نظر ${t.name}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all duration-400",
                i === index ? "w-8 bg-brand-600" : "w-2 bg-ink-200 hover:bg-brand-300 dark:bg-white/15",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="نظر بعدی"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-300"
          >
            <Icon name="chevronRight" size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="نظر قبلی"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-300"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
