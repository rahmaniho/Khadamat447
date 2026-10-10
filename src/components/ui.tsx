import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

export function SectionTitle({ eyebrow, title, desc, id }: { eyebrow?: string; title: string; desc?: string; id?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center" id={id}>
      {eyebrow && <p className="text-sm font-bold text-brand-600">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">{title}</h2>
      {desc && <p className="mt-3 text-base leading-8 text-slate-600">{desc}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "light";
  icon?: IconName;
  external?: boolean;
}) {
  const styles = {
    primary: "bg-brand-700 text-white shadow-lg shadow-brand-700/25 hover:bg-brand-800",
    outline: "border-2 border-brand-200 bg-white text-brand-800 hover:border-brand-500 hover:bg-brand-50",
    light: "bg-white text-brand-800 hover:bg-brand-50",
  }[variant];
  const cls = `inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold transition ${styles}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {icon && <Icon name={icon} size={20} />}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "amber" | "slate" }) {
  const t = {
    brand: "bg-brand-50 text-brand-800 ring-brand-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${t}`}>{children}</span>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="مسیر صفحه" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-brand-700">صفحه اصلی</Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {it.href ? (
              <Link href={it.href} className="hover:text-brand-700">{it.label}</Link>
            ) : (
              <span aria-current="page" className="text-slate-800">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "success" | "warning"; children: React.ReactNode }) {
  const t = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${t}`}>
      {children}
    </div>
  );
}
