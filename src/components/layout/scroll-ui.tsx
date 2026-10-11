"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** نوار پیشرفت مطالعه/اسکرول در بالای صفحه */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-to-l from-brand-500 via-gold-400 to-brand-600 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/** دکمه بازگشت به بالای صفحه */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="بازگشت به بالای صفحه"
      className={cn(
        "fixed bottom-5 end-5 z-[65] grid h-12 w-12 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] text-brand-700 shadow-lift transition-all duration-400 dark:text-brand-200",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Icon name="chevronUp" size={20} />
    </button>
  );
}

/** نوار اقدام شناور موبایل (ثبت و پیگیری) */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "no-print fixed inset-x-3 bottom-3 z-[62] flex gap-2 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)]/95 p-2 shadow-lift backdrop-blur transition-all duration-400 sm:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <a
        href="/request"
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 text-[0.82rem] font-black text-white"
      >
        <Icon name="send" size={17} />
        ثبت درخواست
      </a>
      <a
        href="/track"
        className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] px-4 text-[0.82rem] font-black text-ink-700 dark:text-ink-200"
      >
        <Icon name="track" size={17} />
        پیگیری
      </a>
    </div>
  );
}
