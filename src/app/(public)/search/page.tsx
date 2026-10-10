import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui";
import { SearchBox } from "@/components/article-search";
import { loadSite } from "@/lib/site";
import { searchContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "جست‌وجو",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await loadSite();
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 100);
  const results = term.length >= 2 ? await searchContent(term) : null;
  const total = results ? results.services.length + results.articles.length + results.faqs.length : 0;
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "جست‌وجو" }]} />
      <h1 className="mt-6 text-3xl font-black">جست‌وجو در سایت</h1>
      <div className="mt-6">
        <SearchBox action="/search" defaultValue={term} placeholder="مثلاً: کارت بهداشت" />
      </div>
      {results && (
        <div className="mt-10 space-y-8">
          <p className="text-sm text-slate-600">{total} نتیجه برای «{term}»</p>
          {results.services.length > 0 && (
            <div>
              <h2 className="font-extrabold">خدمات</h2>
              <ul className="mt-3 space-y-2">{results.services.map((s) => <li key={s.slug}><Link className="font-bold text-brand-800 underline" href={`/services/${s.slug}`}>{s.title}</Link></li>)}</ul>
            </div>
          )}
          {results.articles.length > 0 && (
            <div>
              <h2 className="font-extrabold">مقالات</h2>
              <ul className="mt-3 space-y-2">{results.articles.map((a) => <li key={a.slug}><Link className="font-bold text-brand-800 underline" href={`/articles/${a.slug}`}>{a.title}</Link></li>)}</ul>
            </div>
          )}
          {results.faqs.length > 0 && (
            <div>
              <h2 className="font-extrabold">سؤالات متداول</h2>
              <ul className="mt-3 space-y-2"><li><Link className="font-bold text-brand-800 underline" href={`/faq?q=${encodeURIComponent(term)}`}>مشاهده پرسش‌های مرتبط</Link></li></ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
