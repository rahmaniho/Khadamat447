import Link from "next/link";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/lib/cn";

/** بخش استاندارد صفحه با فاصله‌های یکدست */
export function Section({
  children,
  className,
  id,
  tone = "plain",
  container = true,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "plain" | "surface" | "muted" | "brand";
  container?: boolean;
}) {
  const tones = {
    plain: "",
    surface: "bg-[var(--surface)]",
    muted: "bg-[var(--surface-muted)]/60",
    brand: "bg-gradient-to-b from-brand-50/80 to-transparent dark:from-brand-500/5",
  };
  return (
    <section id={id} className={cn("scroll-mt-28 py-14 md:py-20", tones[tone], className)}>
      {container ? <div className="mx-auto max-w-7xl px-4">{children}</div> : children}
    </section>
  );
}

/** سرصفحه صفحات داخلی با مسیر راهنما */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  icon,
  actions,
  tone = "brand",
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Array<{ name: string; href: string }>;
  icon?: string;
  actions?: React.ReactNode;
  tone?: "brand" | "gold" | "rose" | "indigo";
}) {
  const tones: Record<string, string> = {
    brand: "from-brand-800 via-brand-700 to-brand-900",
    gold: "from-gold-700 via-gold-600 to-brand-800",
    rose: "from-rose-700 via-rose-600 to-brand-800",
    indigo: "from-indigo-700 via-indigo-600 to-brand-800",
  };
  return (
    <section className={cn("relative overflow-hidden bg-gradient-to-bl text-white", tones[tone])}>
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.16]" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="مسیر صفحه" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.72rem] font-bold text-white/70">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 && <Icon name="chevronLeft" size={13} className="text-white/40" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-white">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className="transition hover:text-white">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-3xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-[0.72rem] font-black ring-1 ring-white/20 backdrop-blur">
                {icon && <Icon name={icon} size={14} />}
                {eyebrow}
              </span>
            )}
            <h1 className="mt-5 text-2xl font-black leading-[1.5] md:text-4xl">{title}</h1>
            {description && <div className="mt-4 max-w-2xl text-[0.95rem] leading-8 text-white/85">{description}</div>}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

/** نوار فراخوان نهایی */
export function CtaBand({
  title,
  description,
  primary = { href: "/request", label: "شروع ثبت درخواست", icon: "send" },
  secondary,
  note,
}: {
  title: string;
  description: string;
  primary?: { href: string; label: string; icon?: string };
  secondary?: { href: string; label: string; icon?: string };
  note?: string;
}) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-5xl bg-gradient-to-bl from-brand-800 via-brand-700 to-brand-900 px-6 py-12 text-center text-white shadow-2xl shadow-brand-900/25 md:px-16">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" aria-hidden />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-[0.72rem] font-black ring-1 ring-white/20 backdrop-blur">
            <Icon name="sparkles" size={14} />
            سامانه ثبت درخواست آنلاین
          </span>
          <h2 className="mt-5 text-2xl font-black leading-[1.5] md:text-3xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-8 text-white/85">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={primary.href} variant="light" size="lg" icon={primary.icon}>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink
                href={secondary.href}
                size="lg"
                icon={secondary.icon}
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                variant="outline"
              >
                {secondary.label}
              </ButtonLink>
            )}
          </div>
          {note && <p className="mt-6 text-[0.74rem] font-bold text-white/70">{note}</p>}
        </div>
      </div>
    </Section>
  );
}

/** کارت اطلاعات کوچک با آیکون */
export function InfoTile({
  icon,
  title,
  children,
  tone = "brand",
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  tone?: "brand" | "gold" | "info" | "success" | "rose";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
  return (
    <div className="surface-card lift h-full p-5">
      <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tones[tone])}>
        <Icon name={icon} size={21} />
      </span>
      <h3 className="mt-4 font-black text-ink-900 dark:text-white">{title}</h3>
      <div className="mt-2 text-[0.84rem] leading-7 text-ink-600 dark:text-ink-300">{children}</div>
    </div>
  );
}

/** فهرست نکات با تیک */
export function CheckList({
  items,
  columns = 1,
  tone = "brand",
}: {
  items: string[];
  columns?: 1 | 2;
  tone?: "brand" | "gold";
}) {
  return (
    <ul className={cn("grid gap-2.5", columns === 2 && "sm:grid-cols-2")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[0.86rem] leading-7 text-ink-700 dark:text-ink-200">
          <span
            className={cn(
              "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white",
              tone === "brand" ? "bg-brand-600" : "bg-gold-500",
            )}
          >
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
