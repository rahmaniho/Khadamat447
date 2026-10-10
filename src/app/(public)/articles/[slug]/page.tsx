import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ButtonLink } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Icon } from "@/components/icons";
import { loadSite, loadSiteWithServices } from "@/lib/site";
import { getArticleBySlug, getPublishedArticles, type Article } from "@/lib/queries";
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd, absoluteAsset, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { extractFaqPairs } from "@/lib/markdown";
import { formatFaDay } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

function coverOf(a: Article): string | undefined {
  return a.cover_path || undefined;
}

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
    type: "article",
    image: coverOf(a) ?? DEFAULT_OG_IMAGE,
    imageAlt: `تصویر آموزشی: ${a.title}`,
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
  const faqs = extractFaqPairs(a.body_md);
  const cover = coverOf(a);

  // مقاله‌های هم‌خدمت (برای پیوند داخلی و مسیر یادگیری)
  const all = await getPublishedArticles();
  const siblings = all
    .filter((x) => x.slug !== a.slug && x.related_services.some((r) => a.related_services.includes(r)))
    .slice(0, 3);

  const url = site.siteUrl ? `${site.siteUrl}/articles/${a.slug}` : undefined;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "آموزش و مقالات", href: "/articles" }, { label: a.title }]} />
      <header className="mt-6">
        {a.category && <p className="text-sm font-bold text-brand-600">{a.category}</p>}
        <h1 className="mt-2 text-3xl font-black leading-[1.5] md:text-4xl">{a.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          نویسنده: {a.author || "دفتر خدمات سلامت ۴۷۷"} · تاریخ انتشار: {formatFaDay(a.published_at)} · آخرین به‌روزرسانی: {formatFaDay(a.updated_at)}
        </p>
        {a.excerpt && <p className="mt-4 text-lg leading-9 text-slate-700">{a.excerpt}</p>}
      </header>

      {cover && (
        <figure className="mt-8 overflow-hidden rounded-3xl bg-brand-50 ring-1 ring-brand-100">
          <Image
            src={cover}
            alt={`تصویر آموزشی: ${a.title}`}
            width={1200}
            height={675}
            priority
            sizes="(min-width: 896px) 896px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="px-5 py-3 text-xs leading-6 text-slate-500">
            تصویر آموزشی و نمادین است و عکس واقعی از دفتر یا افراد نیست.
          </figcaption>
        </figure>
      )}

      {/* پاسخ کوتاه: موتورهای جست‌وجو و دستیارهای هوش مصنوعی از این بخش برای پاسخ‌گویی استفاده می‌کنند */}
      <section aria-label="پاسخ کوتاه" className="mt-8 rounded-3xl border-r-4 border-brand-500 bg-brand-50/60 p-6">
        <p className="flex items-center gap-2 font-extrabold text-brand-900">
          <Icon name="check" size={18} /> پاسخ کوتاه
        </p>
        <p className="mt-2 leading-8 text-slate-800">{a.excerpt || a.seo_description}</p>
      </section>

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
          <h2 className="text-xl font-extrabold">خدمات مرتبط در قزوین</h2>
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

      {siblings.length > 0 && (
        <aside className="mt-10">
          <h2 className="text-xl font-extrabold">مطالب بیشتر در همین موضوع</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link href={`/articles/${s.slug}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-4 font-bold leading-7 text-slate-900 hover:border-brand-200">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="mt-10 rounded-3xl bg-brand-700 p-8 text-center text-white">
        <p className="text-lg font-bold">برای ثبت درخواست در قزوین آماده‌اید؟</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-brand-100">دفتر خدمات سلامت ۴۷۷ درخواست شما را ثبت و برای پیگیری کد اختصاصی صادر می‌کند.</p>
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
            image: cover ? absoluteAsset(site, cover) : absoluteAsset(site, DEFAULT_OG_IMAGE),
            inLanguage: "fa-IR",
            articleSection: a.category || undefined,
            author: { "@type": "Organization", name: a.author || site.name },
            publisher: {
              "@type": "Organization",
              name: site.name,
              logo: { "@type": "ImageObject", url: absoluteAsset(site, "/brand/logo-mark.png") },
            },
            datePublished: a.published_at || undefined,
            dateModified: a.updated_at,
            about: related.map((r) => ({ "@type": "Service", name: r.title })),
            spatialCoverage: { "@type": "Place", name: site.city },
            mainEntityOfPage: url,
            speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[aria-label='پاسخ کوتاه'] p:last-child"] },
          }),
        }}
      />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />
      )}
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
