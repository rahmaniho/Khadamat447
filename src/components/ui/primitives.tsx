"use client";

/**
 * اجزای پایه رابط کاربری (Design Primitives)
 * ---------------------------------------------------------------
 * دکمه‌ها، نشان‌ها، کارت‌ها، شاخص‌ها و عناصر نمایشی مشترک.
 * همه اجزا با توکن‌های طراحی globals.css ساخته شده‌اند و حالت تاریک
 * و حالت کاهش حرکت را رعایت می‌کنند.
 */
import Link from "next/link";
import React from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { faNumber } from "@/lib/format";

/* ------------------------------------------------------------------ *
 * دکمه
 * ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "light" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-l from-brand-700 to-brand-500 text-white shadow-[0_10px_30px_-12px_rgba(30,122,113,.7)] hover:from-brand-800 hover:to-brand-600 hover:shadow-[0_14px_36px_-12px_rgba(30,122,113,.85)]",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:ring-1 dark:ring-white/10",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-white/15 dark:bg-white/5 dark:text-ink-100 dark:hover:border-brand-400/50 dark:hover:bg-brand-500/10 dark:hover:text-white",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white",
  danger: "bg-danger-600 text-white hover:bg-danger-700 shadow-[0_10px_30px_-14px_rgba(225,29,72,.8)]",
  gold: "bg-gradient-to-l from-gold-600 to-gold-400 text-white hover:from-gold-700 hover:to-gold-500 shadow-[0_10px_30px_-14px_rgba(212,144,28,.8)]",
  light: "bg-white text-brand-800 hover:bg-brand-50 shadow-soft",
  link: "text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 hover:text-brand-800 hover:decoration-brand-500 dark:text-brand-300 p-0 h-auto",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[0.8rem] gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-2xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
  icon: "h-11 w-11 rounded-2xl",
  "icon-sm": "h-9 w-9 rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconEnd?: string;
  loading?: boolean;
  full?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  loading,
  full,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex select-none items-center justify-center font-bold transition-all duration-300 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100",
        variant !== "link" && SIZES[size],
        VARIANTS[variant],
        full && "w-full",
        className,
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === "lg" ? 20 : 18} />
      )}
      {children}
      {iconEnd && !loading && <Icon name={iconEnd} size={size === "lg" ? 20 : 18} />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  full,
  external,
  className,
  children,
  prefetch,
  onClick,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconEnd?: string;
  full?: boolean;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  prefetch?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(
    "inline-flex select-none items-center justify-center font-bold transition-all duration-300 active:scale-[.97]",
    variant !== "link" && SIZES[size],
    VARIANTS[variant],
    full && "w-full",
    className,
  );
  const content = (
    <>
      {icon && <Icon name={icon} size={size === "lg" ? 20 : 18} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === "lg" ? 20 : 18} />}
    </>
  );
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    const isHttp = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} prefetch={prefetch} onClick={onClick}>
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * نشان و برچسب
 * ------------------------------------------------------------------ */

const TONES: Record<string, string> = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200/70 dark:bg-brand-500/12 dark:text-brand-200 dark:ring-brand-400/25",
  gold: "bg-gold-50 text-gold-800 ring-gold-200/80 dark:bg-gold-500/12 dark:text-gold-200 dark:ring-gold-400/25",
  sky: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/12 dark:text-sky-200 dark:ring-sky-400/25",
  slate: "bg-ink-100 text-ink-700 ring-ink-200 dark:bg-white/8 dark:text-ink-200 dark:ring-white/15",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-200 dark:ring-emerald-400/25",
  amber: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/12 dark:text-amber-200 dark:ring-amber-400/25",
  orange: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/12 dark:text-orange-200 dark:ring-orange-400/25",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/12 dark:text-rose-200 dark:ring-rose-400/25",
  violet: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/12 dark:text-violet-200 dark:ring-violet-400/25",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/12 dark:text-indigo-200 dark:ring-indigo-400/25",
  info: "bg-info-50 text-info-700 ring-blue-200 dark:bg-blue-500/12 dark:text-blue-200 dark:ring-blue-400/25",
};

export function Badge({
  children,
  tone = "brand",
  size = "md",
  icon,
  dot,
  className,
  dir,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES | string;
  size?: "sm" | "md";
  icon?: string;
  dot?: boolean;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <span
      dir={dir}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold ring-1",
        size === "sm" ? "px-2.5 py-0.5 text-[0.7rem]" : "px-3 py-1 text-xs",
        TONES[tone] ?? TONES.brand,
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

export function Chip({
  children,
  active,
  onClick,
  icon,
  count,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300",
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_24px_-12px_rgba(30,122,113,.9)]"
          : "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-800 dark:border-white/12 dark:bg-white/5 dark:text-ink-200 dark:hover:border-brand-400/40 dark:hover:text-white",
      )}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "numeric rounded-full px-1.5 text-[0.7rem]",
            active ? "bg-white/20" : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300",
          )}
        >
          {faNumber(count)}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * کارت
 * ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  hover,
  as: Tag = "div",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "section" | "article" | "li";
  padded?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "surface-card",
        padded && "p-6",
        hover && "lift hover:border-brand-200 dark:hover:border-brand-400/30",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  icon,
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "start";
  icon?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        action ? "md:flex-row md:items-end md:justify-between md:text-start" : false,
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" ? "items-center" : "items-start")}>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-black tracking-wide text-brand-700 ring-1 ring-brand-200/70 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-400/25">
            {icon && <Icon name={icon} size={14} />}
            {eyebrow}
          </span>
        )}
        <h2 className="max-w-3xl text-2xl font-black leading-[1.5] text-ink-900 md:text-[2rem] dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-[0.95rem] leading-8 text-ink-600 dark:text-ink-300">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * شاخص‌های آماری
 * ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  trend,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: string;
  tone?: "brand" | "gold" | "info" | "success" | "danger" | "violet";
  trend?: { value: number; label?: string };
}) {
  const toneRing: Record<string, string> = {
    brand: "from-brand-500/15 text-brand-700 dark:text-brand-300",
    gold: "from-gold-500/20 text-gold-700 dark:text-gold-300",
    info: "from-blue-500/15 text-blue-700 dark:text-blue-300",
    success: "from-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    danger: "from-rose-500/15 text-rose-700 dark:text-rose-300",
    violet: "from-violet-500/15 text-violet-700 dark:text-violet-300",
  };
  return (
    <div className="surface-card lift group relative overflow-hidden p-5">
      <div
        className={cn(
          "pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity",
          toneRing[tone],
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-ink-500 dark:text-ink-400">{label}</p>
          <p className="numeric mt-2 text-2xl font-black text-ink-900 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-[0.72rem] font-medium text-ink-500 dark:text-ink-400">{hint}</p>}
        </div>
        {icon && (
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br to-transparent", toneRing[tone])}>
            <Icon name={icon} size={22} />
          </span>
        )}
      </div>
      {trend && (
        <div className="relative mt-3 flex items-center gap-1.5 text-[0.72rem] font-bold">
          <span className={cn("inline-flex items-center gap-1", trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            <Icon name={trend.value >= 0 ? "trendUp" : "trendUp"} size={14} className={trend.value < 0 ? "rotate-180" : ""} />
            {faNumber(Math.abs(trend.value), 1)}٪
          </span>
          <span className="font-medium text-ink-500 dark:text-ink-400">{trend.label ?? "نسبت به هفته گذشته"}</span>
        </div>
      )}
    </div>
  );
}

export function Metric({
  label,
  value,
  icon,
  tone = "brand",
}: {
  label: string;
  value: React.ReactNode;
  icon?: string;
  tone?: "brand" | "gold" | "info" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 px-4 py-3">
      {icon && <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}><Icon name={icon} size={18} /></span>}
      <div className="min-w-0">
        <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">{label}</p>
        <p className="numeric truncate text-sm font-black text-ink-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * عناصر نمایشی کوچک
 * ------------------------------------------------------------------ */

export function Progress({
  value,
  max = 100,
  tone = "brand",
  size = "md",
  showLabel,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "gold" | "success" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const tones: Record<string, string> = {
    brand: "from-brand-600 to-brand-400",
    gold: "from-gold-600 to-gold-400",
    success: "from-emerald-600 to-emerald-400",
    danger: "from-rose-600 to-rose-400",
    info: "from-blue-600 to-blue-400",
  };
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };
  return (
    <div className="w-full">
      <div className={cn("w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10", heights[size])}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-l transition-all duration-700", tones[tone])}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <p className="numeric mt-1.5 text-xs font-bold text-ink-500 dark:text-ink-400">
          {faNumber(Math.round(percent))}٪ تکمیل‌شده
        </p>
      )}
    </div>
  );
}

export function Avatar({ name, color, size = "md" }: { name: string; color?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[0.7rem]", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-2xl font-black text-white", sizes[size])}
      style={{ background: color ? `linear-gradient(135deg, ${color}, ${color}bb)` : "linear-gradient(135deg,#1e7a71,#48b3a5)" }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Rating({ value, size = 16, showValue }: { value: number; size?: number; showValue?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          size={size}
          className={i <= Math.round(value) ? "fill-gold-400 text-gold-400" : "text-ink-300 dark:text-ink-600"}
        />
      ))}
      {showValue && <span className="numeric ms-1 text-xs font-bold text-ink-600 dark:text-ink-300">{faNumber(value, 1)}</span>}
    </span>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="my-6 h-px w-full bg-[var(--border-soft)]" />;
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-[var(--border-soft)]" />
      <span className="text-xs font-bold text-ink-500 dark:text-ink-400">{label}</span>
      <span className="h-px flex-1 bg-[var(--border-soft)]" />
    </div>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-[var(--surface-muted)]/50 px-6 py-14 text-center dark:border-white/12">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-ink-400 shadow-soft dark:bg-white/5 dark:text-ink-300">
        <Icon name={icon} size={30} />
      </span>
      <h3 className="text-lg font-black text-ink-900 dark:text-white">{title}</h3>
      {description && <p className="max-w-md text-sm leading-7 text-ink-600 dark:text-ink-300">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} />;
}

export function Alert({
  tone = "info",
  title,
  children,
  icon,
  className,
}: {
  tone?: "info" | "success" | "warning" | "danger" | "brand";
  title?: string;
  children?: React.ReactNode;
  icon?: string;
  className?: string;
}) {
  const tones: Record<string, { wrap: string; icon: string; iconName: string }> = {
    info: { wrap: "border-blue-200 bg-blue-50/80 text-blue-900 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-100", icon: "text-blue-600 dark:text-blue-300", iconName: "info" },
    success: { wrap: "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100", icon: "text-emerald-600 dark:text-emerald-300", iconName: "checkCircle" },
    warning: { wrap: "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100", icon: "text-amber-600 dark:text-amber-300", iconName: "alert" },
    danger: { wrap: "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100", icon: "text-rose-600 dark:text-rose-300", iconName: "alertCircle" },
    brand: { wrap: "border-brand-200 bg-brand-50/80 text-brand-900 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-100", icon: "text-brand-600 dark:text-brand-300", iconName: "shieldCheck" },
  };
  const t = tones[tone];
  return (
    <div className={cn("flex gap-3 rounded-3xl border p-4 text-sm leading-7", t.wrap, className)}>
      <Icon name={icon ?? t.iconName} size={20} className={cn("mt-1 shrink-0", t.icon)} />
      <div className="min-w-0">
        {title && <p className="font-black">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="numeric rounded-lg border border-ink-200 bg-white px-1.5 py-0.5 font-sans text-[0.68rem] font-bold text-ink-600 shadow-[0_1px_0_rgba(0,0,0,.06)] dark:border-white/15 dark:bg-white/10 dark:text-ink-200">
      {children}
    </kbd>
  );
}

export function Timeline({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ol className={cn("relative space-y-4 ps-7", className)}>{children}</ol>;
}

export function TimelineItem({
  children,
  color = "#1e7a71",
  icon,
  last,
  meta,
  title,
}: {
  children?: React.ReactNode;
  color?: string;
  icon?: string;
  last?: boolean;
  meta?: React.ReactNode;
  title?: React.ReactNode;
}) {
  return (
    <li className="relative">
      {!last && (
        <span
          className="absolute -bottom-4 start-[-1.28rem] top-8 w-px bg-[var(--border-soft)]"
          style={{ background: `linear-gradient(180deg, ${color}55, transparent)` }}
          aria-hidden
        />
      )}
      <span
        className="absolute start-[-1.9rem] top-1 grid h-7 w-7 place-items-center rounded-full text-white shadow-soft"
        style={{ background: color }}
        aria-hidden
      >
        {icon && <Icon name={icon} size={14} strokeWidth={2.4} />}
      </span>
      {title && <div className="flex flex-wrap items-center gap-2 font-bold text-ink-900 dark:text-white">{title}</div>}
      {meta && <div className="mt-1 text-[0.72rem] font-medium text-ink-500 dark:text-ink-400">{meta}</div>}
      {children}
    </li>
  );
}
