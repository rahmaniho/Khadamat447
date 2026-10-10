import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import type { Service } from "@/lib/queries";

const ICONS: Record<string, IconName> = {
  card: "card",
  book: "book",
  badge: "badge",
  clipboard: "clipboard",
  chat: "chat",
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 group-hover:bg-brand-700 group-hover:text-white">
        <Icon name={ICONS[service.icon] ?? "shield"} size={28} />
      </span>
      <h3 className="mt-5 text-lg font-extrabold leading-8 text-slate-900">
        <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
          {service.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{service.summary}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Link href={`/request?service=${service.slug}`} className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
          ثبت درخواست
        </Link>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          جزئیات <Icon name="arrowLeft" size={16} />
        </span>
      </div>
    </article>
  );
}
