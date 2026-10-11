import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleToc, ShareButtons } from "@/components/articles/article-tools";
import { Markdown } from "@/components/site/markdown";
import { CtaBand, Section } from "@/components/site/section";
import { Badge, ButtonLink, Card, SectionHeading } from "@/components/ui/primitives";
import { ARTICLES, SERVICES, getArticle, getRelatedArticles, getService } from "@/lib/content";
import { SITE } from "@/lib/content/site";
import { articleJsonLd, breadcrumbJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { fa, formatDate } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return pageMetadata({ title: "مقاله یافت نشد", description: "", path: `/articles/${slug}`, noindex: true });
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    image: article.cover,
    imageAlt: article.title,
    type: "article",
    keywords: article.tags,
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article.slug, 3);
  const services = article.relatedServices.map((s) => getService(s)).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            articleJsonLd({
              title: article.title,
              description: article.excerpt,
              slug: article.slug,
              image: article.cover,
              author: article.author,
              publishedAt: article.publishedAt,
              category: article.category,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "آموزش‌ها", href: "/articles" },
              { name: article.title, href: `/articles/${article.slug}` },
            ]),
          ),
        }}
      />

      <article>
        {/* سرصفحه مقاله */}
        <header className="relative overflow-hidden border-b border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-25 dark:opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 py-10 md:py-14">
            <nav aria-label="مسیر صفحه" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
                <li>
                  <Link href="/" className="transition hover:text-brand-700 dark:hover:text-brand-300">
                    خانه
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="chevronLeft" size={13} className="text-ink-300" />
                  <Link href="/articles" className="transition hover:text-brand-700 dark:hover:text-brand-300">
                    آموزش‌ها
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="chevronLeft" size={13} className="text-ink-300" />
                  <span className="line-clamp-1 text-ink-700 dark:text-ink-200">{article.category}</span>
                </li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon="book">
                {article.category}
              </Badge>
              <Badge tone="slate" icon="clock">
                {fa(article.readMinutes)} دقیقه مطالعه
              </Badge>
              <Badge tone="slate" icon="calendar">
                {formatDate(article.publishedAt, "medium")}
              </Badge>
              <Badge tone="gold" icon="edit">
                {fa(article.wordCount)} واژه
              </Badge>
            </div>

            <h1 className="mt-5 text-2xl font-black leading-[1.55] text-ink-900 md:text-[2.1rem] dark:text-white">
              {article.title}
            </h1>
            <p className="mt-4 text-[0.96rem] leading-8 text-ink-600 dark:text-ink-300">{article.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 text-[0.76rem] font-bold text-ink-600 dark:text-ink-300">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon name="badge" size={17} />
                </span>
                {article.author}
              </span>
              <ShareButtons title={article.title} slug={article.slug} />
            </div>
          </div>
        </header>

        {/* تصویر کاور */}
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative -mt-2 aspect-[16/8] overflow-hidden rounded-4xl border border-[var(--border-soft)] shadow-lift">
            <Image src={article.cover} alt={article.title} fill priority sizes="(min-width:1024px) 56rem, 100vw" className="object-cover" />
          </div>
        </div>

        <Section>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_16rem] lg:items-start">
            <div className="min-w-0">
              <Markdown source={article.body} />

              {services.length > 0 && (
                <Card className="mt-10">
                  <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                    <Icon name="services" size={19} className="text-brand-600 dark:text-brand-400" />
                    خدمات مرتبط با این راهنما
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <li key={service!.slug}>
                        <Link
                          href={`/services/${service!.slug}`}
                          className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] p-3.5 transition hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/5"
                        >
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${service!.gradient}`}>
                            <Icon name={service!.icon} size={19} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[0.82rem] font-black text-ink-900 dark:text-white">
                              {service!.title}
                            </span>
                            <span className="block text-[0.68rem] text-ink-500 dark:text-ink-400">{service!.duration}</span>
                          </span>
                          <Icon name="chevronLeft" size={16} className="ms-auto shrink-0 text-ink-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href="/request" icon="send" className="mt-5">
                    ثبت درخواست آنلاین
                  </ButtonLink>
                </Card>
              )}

              <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 text-[0.8rem] leading-7 text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
                <strong className="font-black">توجه:</strong> این مطلب آموزشی است و جایگزین مقررات رسمی یا نظر کارشناس نیست.
                الزامات و مدارک نهایی هر خدمت پیش از اعلام رسمی توسط دفتر بازبینی می‌شود.
              </div>
            </div>

            {/* ستون کنار: فهرست مطالب */}
            <aside className="space-y-4 lg:sticky lg:top-28">
              <ArticleToc body={article.body} />
              <Card className="space-y-3 p-5">
                <h3 className="text-[0.84rem] font-black text-ink-900 dark:text-white">پرسشی دارید؟</h3>
                <p className="text-[0.74rem] leading-6 text-ink-600 dark:text-ink-300">
                  پرسش خود را برای کارشناس دفتر ارسال کنید یا تلفنی راهنمایی بگیرید.
                </p>
                <a
                  href={`tel:${SITE.phones[0].value}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-3.5 py-2.5 text-[0.76rem] font-black text-white transition hover:bg-brand-700"
                >
                  <Icon name="phone" size={15} />
                  <span className="numeric">{toFaDigits(SITE.phones[0].display)}</span>
                </a>
                <ButtonLink href="/request?service=other" variant="outline" size="sm" icon="chat" full>
                  ارسال پرسش
                </ButtonLink>
              </Card>
            </aside>
          </div>
        </Section>

        <Section tone="surface">
          <SectionHeading
            eyebrow="مطالعه بیشتر"
            icon="book"
            title="مقالات مرتبط"
            description="راهنماهایی که با موضوع این مطلب هم‌پوشانی دارند."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <div key={item.slug} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <ArticleCard article={item} />
              </div>
            ))}
          </div>
        </Section>
      </article>

      <CtaBand
        title="این راهنما را خواندید؟ قدم بعدی را بردارید"
        description="اگر اطلاعات لازم را آماده کرده‌اید، درخواست خود را ثبت کنید؛ در غیر این صورت پرسش خود را برای کارشناس دفتر بفرستید."
        secondary={{ href: "/guide", label: "راهنمای گام‌به‌گام", icon: "book2" }}
      />
    </>
  );
}
