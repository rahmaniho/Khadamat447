"use client";

/**
 * جست‌وجوی متن کامل (سمت مرورگر)
 * ---------------------------------------------------------------
 * نتیجه‌ها از فهرست محتوای سایت محاسبه می‌شود؛ بنابراین جست‌وجو بدون
 * وابستگی به سرور و در خروجی استاتیک هم کار می‌کند.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { PageHero, Section } from "@/components/site/section";
import { Badge, Button, ButtonLink, Card, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { SearchInput } from "@/components/ui/form";
import { ARTICLES, FAQS, SERVICES, searchFullText } from "@/lib/content";
import { fa, highlight } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

const SUGGESTIONS = ["کارت بهداشت", "مدارک", "آموزش اصناف", "صلاحیت", "ممیزی", "پیگیری", "تمدید", "المثنی"];

const GROUPS = [
  { key: "service" as const, title: "خدمات", icon: "services" },
  { key: "article" as const, title: "مقالات و راهنماها", icon: "book" },
  { key: "faq" as const, title: "پرسش‌های متداول", icon: "chat" },
  { key: "page" as const, title: "صفحه‌ها", icon: "layers" },
];

export function SearchExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const query = (params.get("q") ?? "").trim();
  const [draft, setDraft] = useState(query);

  const results = useMemo(() => (query.length >= 2 ? searchFullText(query) : null), [query]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (value.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <>
      <PageHero
        eyebrow="جست‌وجو"
        icon="search"
        title="جست‌وجو در کل سایت"
        description="عبارت موردنظر خود را بنویسید؛ جست‌وجو در متن کامل خدمات، مقالات آموزشی، پرسش‌های متداول و صفحه‌های سایت انجام می‌شود."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "جست‌وجو", href: "/search" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="services" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(SERVICES.length)} خدمت
            </Badge>
            <Badge tone="brand" icon="book" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(ARTICLES.length)} مقاله
            </Badge>
            <Badge tone="brand" icon="chat" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(FAQS.length)} پرسش
            </Badge>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <Card className="p-5">
            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <SearchInput
                  value={draft}
                  onChange={setDraft}
                  placeholder="مثلاً: مدارک کارت بهداشت، تمدید صلاحیت، پیگیری درخواست"
                  autoFocus={!query}
                />
              </div>
              <Button type="submit" icon="search">
                جست‌وجو
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">جست‌وجوهای پرتکرار:</span>
              {SUGGESTIONS.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-[0.72rem] font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </Card>

          {results && (
            <p className="mt-6 flex items-center gap-2 text-[0.82rem] font-bold text-ink-600 dark:text-ink-300">
              <Icon name="search" size={16} className="text-brand-600 dark:text-brand-400" />
              {fa(results.total)} نتیجه برای «{query}»
            </p>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          {!results ? (
            <EmptyState
              icon="search"
              title="عبارت جست‌وجو را وارد کنید"
              description="برای دریافت نتیجه، حداقل دو نویسه بنویسید. جست‌وجو در متن کامل مقالات، خدمات، پرسش‌ها و صفحه‌های سایت انجام می‌شود."
            />
          ) : results.hits.length === 0 ? (
            <EmptyState
              icon="search"
              title={`نتیجه‌ای برای «${query}» یافت نشد`}
              description="املای عبارت را بررسی کنید، عبارت کوتاه‌تری بنویسید یا از فهرست خدمات و پرسش‌های متداول استفاده کنید."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/services" icon="services" size="sm">
                    فهرست خدمات
                  </ButtonLink>
                  <ButtonLink href="/faq" variant="outline" icon="chat" size="sm">
                    پرسش‌های متداول
                  </ButtonLink>
                  <ButtonLink href="/request?service=other" variant="ghost" icon="send" size="sm">
                    پرسش از کارشناس
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <div className="space-y-8">
              {GROUPS.map((group) => {
                const hits = results.groups[group.key];
                if (!hits || hits.length === 0) return null;
                return (
                  <section key={group.key}>
                    <SectionHeading align="start" eyebrow={`${fa(hits.length)} نتیجه`} icon={group.icon} title={group.title} />
                    <ul className="mt-5 space-y-3">
                      {hits.map((hit) => (
                        <li key={`${hit.type}-${hit.href}`}>
                          <Link href={hit.href} className="surface-card lift flex items-start gap-4 p-4">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                              <Icon name={hit.icon} size={20} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-ink-900 dark:text-white">
                                  {highlight(hit.title, query).map((part, index) =>
                                    part.match ? (
                                      <mark key={index} className="rounded bg-gold-200/80 px-0.5 text-ink-900 dark:bg-gold-400/30 dark:text-white">
                                        {part.text}
                                      </mark>
                                    ) : (
                                      <span key={index}>{part.text}</span>
                                    ),
                                  )}
                                </span>
                                {hit.badge && (
                                  <Badge tone="slate" size="sm">
                                    {hit.badge}
                                  </Badge>
                                )}
                              </span>
                              <span className="mt-1.5 line-clamp-2 block text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
                                {highlight(hit.description, query).map((part, index) =>
                                  part.match ? (
                                    <mark key={index} className="rounded bg-gold-200/70 px-0.5 text-ink-900 dark:bg-gold-400/25 dark:text-white">
                                      {part.text}
                                    </mark>
                                  ) : (
                                    <span key={index}>{part.text}</span>
                                  ),
                                )}
                              </span>
                            </span>
                            <Icon name="chevronLeft" size={18} className="mt-3 shrink-0 text-ink-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
