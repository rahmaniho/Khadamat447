import { cn } from "@/lib/cn";

/**
 * نشان (لوگو) برداری دفتر خدمات سلامت ۴۷۷
 * ---------------------------------------------------------------
 * ترکیبی از سپر سلامت، ضربان و عدد ۴۷۷. کاملاً SVG و مقیاس‌پذیر،
 * بنابراین در همه اندازه‌ها بدون افت کیفیت نمایش داده می‌شود.
 */
export function LogoMark({
  size = 40,
  className,
  gradientId = "logo-grad",
}: {
  size?: number;
  className?: string;
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="نشان دفتر خدمات سلامت ۴۷۷"
    >
      <defs>
        <linearGradient id={`${gradientId}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a978b" />
          <stop offset="55%" stopColor="#1e7a71" />
          <stop offset="100%" stopColor="#17413e" />
        </linearGradient>
        <linearGradient id={`${gradientId}-pulse`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e3ab33" />
          <stop offset="100%" stopColor="#f2dc97" />
        </linearGradient>
      </defs>
      <path
        d="M24 2.5 41.5 9v12.2C41.5 31.4 34.2 40.6 24 45.5 13.8 40.6 6.5 31.4 6.5 21.2V9z"
        fill={`url(#${gradientId}-bg)`}
      />
      <path
        d="M24 2.5 41.5 9v12.2C41.5 31.4 34.2 40.6 24 45.5 13.8 40.6 6.5 31.4 6.5 21.2V9z"
        fill="none"
        stroke="rgba(255,255,255,.28)"
        strokeWidth="1.2"
      />
      <path
        d="M13 25.5h5.4l2.2-6.2 3.6 12 2.8-8.2 1.8 4h6.2"
        fill="none"
        stroke={`url(#${gradientId}-pulse)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 15.5h12" stroke="rgba(255,255,255,.75)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = 42,
  className,
  light,
}: {
  variant?: "full" | "mark";
  size?: number;
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {variant === "full" && (
        <span className="flex flex-col leading-tight">
          <span className={cn("text-[1.02rem] font-black tracking-tight", light ? "text-white" : "text-ink-900 dark:text-white")}>
            دفتر خدمات سلامت <span className="text-brand-600 dark:text-brand-300">۴۷۷</span>
          </span>
          <span className={cn("text-[0.63rem] font-bold tracking-[0.18em]", light ? "text-white/60" : "text-ink-400 dark:text-ink-500")}>
            KHADAMAT 447 · QAZVIN
          </span>
        </span>
      )}
    </span>
  );
}
