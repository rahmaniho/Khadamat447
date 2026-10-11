import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toFaDigits } from "@/lib/digits";
import type { ServiceView } from "@/lib/content";

export function ServiceCard({ service, compact }: { service: ServiceView; compact?: boolean }) {
  return (
    <article
      className={cn(
        "surface-card lift group relative flex h-full flex-col overflow-hidden",
        compact ? "p-5" : "p-6",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition-opacity duration-500 group-hover:opacity-30",
          service.gradient,
        )}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br text-white shadow-lg", service.gradient)}>
          <Icon name={service.icon} size={26} />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {service.popular && (
            <Badge tone="gold" size="sm" icon="sparkles">
              پرمراجعه
            </Badge>
          )}
          <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[0.62rem] font-black text-ink-500 dark:text-ink-400">
            {toFaDigits(service.fields.length)} فیلد اختصاصی
          </span>
        </div>
      </div>

      <h3 className="relative mt-5 text-[1.02rem] font-black leading-8 text-ink-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
        {service.title}
      </h3>
      <p className="relative mt-2 flex-1 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
        {compact ? service.tagline : service.summary}
      </p>

      {!compact && service.highlights.length > 0 && (
        <ul className="relative mt-4 space-y-1.5">
          {service.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-[0.76rem] leading-6 text-ink-600 dark:text-ink-300">
              <Icon name="check" size={14} strokeWidth={2.6} className="mt-1 shrink-0 text-brand-600 dark:text-brand-400" />
              {h}
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
        <span className="flex items-center gap-1.5 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
          <Icon name="clock" size={13} />
          {service.duration}
        </span>
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2 text-[0.72rem] font-black text-brand-700 transition-all group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/12 dark:text-brand-200"
        >
          جزئیات و ثبت درخواست
          <Icon name="arrowLeft" size={14} />
        </Link>
      </div>
    </article>
  );
}
