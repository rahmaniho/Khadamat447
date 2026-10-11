"use client";

import { useMemo, useState } from "react";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { ServiceCard } from "@/components/services/service-card";
import { SearchInput } from "@/components/ui/form";
import { normalizeFa } from "@/lib/format";
import type { ServiceView } from "@/lib/content";

export function ServicesShowcase({ services, searchable = false }: { services: ServiceView[]; searchable?: boolean }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("همه");

  const tags = useMemo(() => ["همه", ...Array.from(new Set(services.flatMap((s) => s.tags))).slice(0, 8)], [services]);

  const filtered = useMemo(() => {
    const q = normalizeFa(query);
    return services.filter((service) => {
      if (tag !== "همه" && !service.tags.includes(tag)) return false;
      if (!q) return true;
      return normalizeFa(`${service.title} ${service.tagline} ${service.summary} ${service.audienceLabel} ${service.tags.join(" ")}`).includes(q);
    });
  }, [services, query, tag]);

  return (
    <div className="space-y-8">
      {searchable && (
        <div className="surface-card mx-auto flex max-w-3xl flex-col gap-4 p-5">
          <SearchInput value={query} onChange={setQuery} placeholder="جست‌وجو در خدمات… (مثلاً: کارت بهداشت، ممیزی، آموزش)" />
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="services"
          title="خدمتی با این مشخصات یافت نشد"
          description="عبارت دیگری را امتحان کنید یا درخواست خود را از طریق «سایر درخواست‌ها» ثبت کنید تا کارشناس دفتر راهنمایی کند."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service, i) => (
            <div key={service.slug} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
