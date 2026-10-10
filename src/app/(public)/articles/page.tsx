import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, SectionTitle } from "@/components/ui";
import { SearchBox } from "@/components/article-search";
import { loadSite } from "@/lib/site";
import { getPublishedArticles, getArticleCategories } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { formatFaDay } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({
    title: "آموزش و مقالات",
    description: "مقالات آموزشی دفتر خدمات سلامت ۴۷۷ قزوین: راهنمای ثبت درخواست، مدارک کارت بهداشت، آماده‌سازی برای ممیزی و پاسخ به سؤالات رایج.",
    path: "/articles",
    site,
  });
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  // در حالت static export، searchParams در build-time موجود نیست
  let q = "";
  let cat = "";
  try {
    const sp = await searchParams;
    q = sp?.q || "";
    cat = sp?.cat || "";
  } catch {
    /* ignore: build-time */
  }
  const [articles, categories] = await Promise.all([
    getPublishedArticles(cat || undefined, q.slice(0, 100) || undefined),
    getArticleCategories(),
  ]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Breadcrumbs items={[{ label: "آموزش و مقالات" }]} />
      <div className="mt-6">
        <SectionTitle eyebrow="آموزش و مقالات" title="راهنماها و مقالات آموزشی" desc="مطالب آموزشی جایگزین مقررات رسمی یا تصمیم مراجع ذی‌صلاح نیست." />
      </div>
      <div className="mx-auto mt-8 max-w-2xl">
        <SearchBox action="/articles" defaultValue={q} />
      </div>
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/articles" className={`rounded-full px-4 py-2 text-sm font-bold ${!cat ? "bg-brand-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>همه</Link>
          {categories.map((c) => (
            <Link key={c} href={`/articles?cat=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "bg-brand-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
              {c}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white hover:border-brand-200 hover:shadow-md">
            {a.cover_path && (
              <div className="relative aspect-video bg-brand-50">
                <Image
                  src={a.cover_path}
                  alt={`تصویر آموزشی: ${a.title}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-bold text-brand-600">{a.category}</p>
              <h2 className="mt-2 text-lg font-extrabold leading-8">{a.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{a.excerpt}</p>
              <p className="mt-4 text-xs text-slate-500">به‌روزرسانی: {formatFaDay(a.updated_at)}</p>
            </div>
          </Link>
        ))}
      </div>
      {articles.length === 0 && <p className="mt-10 text-center text-slate-600">مقاله‌ای با این مشخصات پیدا نشد.</p>}
    </section>
  );
}
