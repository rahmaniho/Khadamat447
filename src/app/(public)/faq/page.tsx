import type { Metadata } from "next";
import { Breadcrumbs, SectionTitle } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { SearchBox } from "@/components/article-search";
import { loadSite } from "@/lib/site";
import { getPublishedFaqs } from "@/lib/queries";
import { pageMetadata, jsonLd, faqJsonLd } from "@/lib/seo";
import { stripMarkdown } from "@/lib/markdown";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({ title: "سؤالات متداول", description: "پاسخ سؤالات متداول درباره ثبت درخواست، مدارک، پیگیری و خدمات دفتر خدمات سلامت ۴۷۷ قزوین.", path: "/faq", site });
}

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  await loadSite();
  const all = await getPublishedFaqs();
  const needle = q.trim().toLowerCase();
  const faqs = needle ? all.filter((f) => `${f.question} ${f.answer_md}`.toLowerCase().includes(needle)) : all;
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "سؤالات متداول" }]} />
      <div className="mt-6">
        <SectionTitle eyebrow="راهنما" title="سؤالات متداول" desc="اگر پاسخ پرسش خود را پیدا نکردید، از طریق صفحه تماس با دفتر در ارتباط باشید." />
      </div>
      <div className="mt-8">
        <SearchBox action="/faq" defaultValue={q} placeholder="جست‌وجو در پرسش‌ها…" />
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details key={f.id} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-md">
            <summary className="cursor-pointer list-none font-bold text-slate-900">{f.question}</summary>
            <Markdown source={f.answer_md} className="mt-3 text-sm leading-8 text-slate-700" />
          </details>
        ))}
        {faqs.length === 0 && <p className="text-center text-slate-600">موردی پیدا نشد.</p>}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(faqJsonLd(all.map((f) => ({ question: f.question, answer: stripMarkdown(f.answer_md) })))),
        }}
      />
    </section>
  );
}
