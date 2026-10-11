"use client";

/**
 * لایه‌های شناور و ناوبری درون‌صفحه‌ای
 * ---------------------------------------------------------------
 * پنجره (Modal)، کشوی کناری (Drawer)، تب‌ها، آکاردئون، راهنما (Tooltip)
 * و میزبان اعلان‌های کوچک.
 */
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { Button } from "./primitives";

/* ------------------------------------------------------------------ *
 * قلاب قفل اسکرول و بستن با Escape
 * ------------------------------------------------------------------ */

function useDismissable(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

/* ------------------------------------------------------------------ *
 * پنجره
 * ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
}) {
  useDismissable(open, onClose);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-ink-950/55 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        className={cn(
          // در موبایل به‌صورت برگه پایینی (bottom sheet) باز می‌شود و با
          // safe-area از نشانگر خانه گوشی‌های ناچ‌دار فاصله می‌گیرد.
          "relative z-10 w-full animate-scale-in rounded-t-4xl border border-[var(--border-soft)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl sm:rounded-4xl sm:pb-0",
          widths[size],
        )}
      >
        <header className="flex items-start gap-4 border-b border-[var(--border-soft)] p-5">
          {icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name={icon} size={22} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-ink-900 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-[0.8rem] leading-7 text-ink-500 dark:text-ink-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="بستن"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border-soft)] p-4">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "تأیید و حذف",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "brand";
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon="alert"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ *
 * کشو
 * ------------------------------------------------------------------ */

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "start",
  width = "max-w-md",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "start" | "end";
  width?: string;
  footer?: React.ReactNode;
}) {
  useDismissable(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <aside
        className={cn(
          "absolute top-0 bottom-0 w-full animate-scale-in border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl",
          width,
          side === "start" ? "start-0 border-e" : "end-0 border-s",
        )}
      >
        <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom,0px)]">
          {title && (
            <header className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] p-5">
              <h2 className="text-lg font-black text-ink-900 dark:text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                aria-label="بستن"
              >
                <Icon name="close" size={18} />
              </button>
            </header>
          )}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer && <footer className="border-t border-[var(--border-soft)] p-4">{footer}</footer>}
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * تب‌ها
 * ------------------------------------------------------------------ */

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: Array<{ id: string; label: string; icon?: string; count?: number }>;
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1", className)} role="tablist">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-250",
              isActive
                ? "bg-brand-600 text-white shadow-[0_10px_26px_-14px_rgba(30,122,113,.9)]"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/8 dark:hover:text-white",
            )}
          >
            {t.icon && <Icon name={t.icon} size={16} />}
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "numeric rounded-full px-1.5 text-[0.68rem]",
                  isActive ? "bg-white/20" : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * آکاردئون
 * ------------------------------------------------------------------ */

export function Accordion({
  items,
  multiple = false,
  defaultOpen,
}: {
  items: Array<{ id: string; title: React.ReactNode; content: React.ReactNode; meta?: React.ReactNode; icon?: string }>;
  multiple?: boolean;
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen ? [defaultOpen] : []);
  const toggle = useCallback(
    (id: string) => {
      setOpen((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        return multiple ? [...prev, id] : [id];
      });
    },
    [multiple],
  );
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "surface-card overflow-hidden transition-all duration-300",
              isOpen && "border-brand-200 shadow-lift dark:border-brand-400/30",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 p-5 text-start"
            >
              {item.icon && (
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-colors",
                    isOpen ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
                  )}
                >
                  <Icon name={item.icon} size={20} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-black leading-7 text-ink-900 dark:text-white">{item.title}</span>
                {item.meta && <span className="mt-0.5 block text-[0.72rem] text-ink-500 dark:text-ink-400">{item.meta}</span>}
              </span>
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300",
                  isOpen ? "rotate-180 bg-brand-600 text-white" : "bg-ink-100 text-ink-500 dark:bg-white/10 dark:text-ink-300",
                )}
              >
                <Icon name="chevronDown" size={16} />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[var(--border-soft)] p-5 pt-4">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * راهنما
 * ------------------------------------------------------------------ */

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      aria-describedby={show ? id : undefined}
    >
      {children}
      {show && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            // مرکزگیری با inset دو‌طرفه + margin خودکار (منطقی و بی‌وابسته به
            // جهت نوشتار) — عرض راهنما متغیر است و translate در RTL مبهم بود
            "pointer-events-none absolute start-0 end-0 z-50 mx-auto w-max max-w-64 animate-fade-in rounded-xl bg-ink-950 px-3 py-2 text-[0.7rem] font-bold leading-6 text-white shadow-xl dark:bg-white dark:text-ink-900",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * اعلان کوچک
 * ------------------------------------------------------------------ */

export function ToasterHost({
  toasts,
  onDismiss,
}: {
  toasts: Array<{ id: number; title: string; description?: string; tone: "success" | "error" | "info" | "warning" }>;
  onDismiss: (id: number) => void;
}) {
  const tones: Record<string, { icon: string; ring: string; text: string }> = {
    success: { icon: "checkCircle", ring: "border-emerald-200 dark:border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
    error: { icon: "alertCircle", ring: "border-rose-200 dark:border-rose-500/30", text: "text-rose-600 dark:text-rose-400" },
    info: { icon: "info", ring: "border-blue-200 dark:border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
    warning: { icon: "alert", ring: "border-amber-200 dark:border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
  };
  return (
    <div
      // در موبایل بالاتر از نوار اقدام شناور قرار می‌گیرد تا دکمه‌های
      // «ثبت درخواست/پیگیری» زیر اعلان پنهان نشوند.
      className="pointer-events-none fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom,0px))] start-4 z-[95] flex w-[min(94vw,24rem)] flex-col gap-2 sm:bottom-4"
    >
      {toasts.map((t) => {
        const tone = tones[t.tone];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex animate-scale-in items-start gap-3 rounded-2xl border bg-[var(--surface)] p-3.5 shadow-lift",
              tone.ring,
            )}
            role="status"
          >
            <Icon name={tone.icon} size={20} className={cn("mt-0.5 shrink-0", tone.text)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-ink-900 dark:text-white">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[0.74rem] leading-6 text-ink-500 dark:text-ink-400">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="hit-expand grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 dark:hover:bg-white/10"
              aria-label="بستن اعلان"
            >
              <Icon name="close" size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ظاهر شدن هنگام اسکرول
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("transition-all duration-700 ease-out", visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function Counter({
  value,
  duration = 1400,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(value * eased);
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            run();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("fa-IR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="numeric">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
