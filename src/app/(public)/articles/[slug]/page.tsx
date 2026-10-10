import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ButtonLink } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { loadSite, loadSiteWithServices } from "@/lib/site";
import { getArticleBySlug } from "@/lib/queries";
import { pageMetadata, jsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatFaDay } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadSite();
  const a = await getArticleBySlug(slug);
  if (!a || a.status !== "published") return { title: "مقاله یافت نشد", robots: { index: false } };
  return pageMetadata({
    title: a.seo_title || a.title,
    description: a.seo_description || a.excerpt,
    path: `/articles/${a.slug}`,
    site,
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const { site, services } = await loadSiteWithServices();
  const a = await getArticleBySlug(slug);
  if (!a || a.status !== "published") notFound();

  const headings = a.body_md
    .split("\n")
    .map((l) => /^##\s+(.*)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .map((m) => m[1]);
  const related = services.filter((s) => a.related_services.includes(s.slug));
  const reviewed = a.updated_at;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "آموزش و مقالات", href: "/articles" }, { label: a.title }]} />
      <header className="mt-6">
        {a.category && <p className="text-sm font-bold text-brand-600">{a.category}</p>}
        <h1 className="mt-2 text-3xl font-black leading-[1.5] md:text-4xl">{a.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          نویسنده: {a.author || "دفتر خدمات سلامت ۴۷۷"} · تاریخ انتشار: {formatFaDay(a.published_at)} · آخرین به‌روزرسانی: {formatFaDay(reviewed)}
        </p>
        {a.excerpt && <p className="mt-4 text-lg leading-9 text-slate-700">{a.excerpt}</p>}
      </header>

      {headings.length > 0 && (
        <nav aria-label="فهرست مطالب" className="mt-8 rounded-3xl border border-brand-100 bg-brand-50/50 p-6">
          <p className="font-extrabold">فهرست مطالب</p>
          <ol className="mt-3 list-decimal space-y-1 pr-5 text-sm leading-7 text-brand-900">
            {headings.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-8 rounded-3xl bg-white p-6 md:p-10">
        <Markdown source={a.body_md} className="text-base text-slate-800" />
      </div>

      {related.length > 0 && (
        <aside className="mt-10">
          <h2 className="text-xl font-extrabold">خدمات مرتبط</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/services/${r.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-4 font-bold text-brand-800 hover:border-brand-200">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="mt-10 rounded-3xl bg-brand-700 p-8 text-center text-white">
        <p className="text-lg font-bold">برای ثبت درخواست آماده‌اید؟</p>
        <div className="mt-5">
          <ButtonLink href="/request" variant="light" icon="send">ثبت درخواست آنلاین</ButtonLink>
        </div>
      </div>
      <p className="mt-6 text-xs leading-6 text-slate-500">
        این مطلب جنبه آموزشی دارد و جایگزین مقررات رسمی یا تصمیم مراجع ذی‌صلاح نیست. ثبت درخواست به معنی تأیید نهایی نیست.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.seo_description || a.excerpt,
            inLanguage: "fa-IR",
            author: { "@type": "Organization", name: a.author || site.name },
            publisher: { "@type": "Organization", name: site.name },
            datePublished: a.published_at || undefined,
            dateModified: a.updated_at,
            mainEntityOfPage: site.siteUrl ? `${site.siteUrl}/articles/${a.slug}` : undefined,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "صفحه اصلی", url: site.siteUrl || "/" },
              { name: "آموزش و مقالات", url: `${site.siteUrl}/articles` },
              { name: a.title, url: `${site.siteUrl}/articles/${a.slug}` },
            ]),
          ),
        }}
      />
    </article>
  );
}
