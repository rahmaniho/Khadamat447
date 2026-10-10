import { Badge } from "@/components/ui";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-600">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = REQUEST_STATUSES[status as RequestStatus];
  const tone = meta?.tone;
  const cls: Record<string, string> = {
    sky: "bg-sky-100 text-sky-800",
    amber: "bg-amber-100 text-amber-800",
    orange: "bg-orange-100 text-orange-800",
    indigo: "bg-indigo-100 text-indigo-800",
    violet: "bg-violet-100 text-violet-800",
    emerald: "bg-emerald-100 text-emerald-800",
    rose: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cls[tone ?? ""] ?? "bg-slate-100 text-slate-700"}`}>
      {meta?.label ?? status}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">{children}</p>;
}

export { Badge };

export const btn = {
  primary: "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60",
  ghost: "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50",
  danger: "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700",
};
