import type { Metadata } from "next";
import { ArticleExplorer } from "@/components/articles/article-explorer";
import { ArticleCard } from "@/components/articles/article-card";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Badge, ButtonLink, SectionHeading } from "@/components/ui/primitives";
import { ARTICLES, ARTICLE_CATEGORIES, SERVICES } from "@/lib/content";
import { itemListJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { fa } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "آموزش‌ها و راهنماها",
  description:
    "مقالات آموزشی دفتر خدمات سلامت ۴۷۷ قزوین درباره کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی؛ راهنمای مدارک، مراحل و پرسش‌های رایج.",
  path: "/articles",
  keywords: ["راهنمای کارت بهداشت", "آموزش بهداشت اصناف", "صلاحیت بهداشت", "ممیزی بهداشتی", "مقالات"],
});

export default function ArticlesPage() {
  const featured = ARTICLES.slice(0, 2);
  const totalMinutes = ARTICLES.reduce((sum, a) => sum + a.readMinutes, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            itemListJsonLd({
              name: "آموزش‌ها و راهنماهای دفتر خدمات سلامت ۴۷۷",
              path: "/articles",
              items: ARTICLES.map((a) => ({ name: a.title, href: `/articles/${a.slug}`, description: a.excerpt })),
            }),
          ),
        }}
      />
      <PageHero
        eyebrow="آموزش و راهنما"
        icon="book"
        title="راهنماهای کاربردی خدمات سلامت"
        description="مطالب آموزشی با زبان ساده و ساختار مشخص: پاسخ کوتاه، توضیح کامل، پرسش‌های متداول و نکات کاربردی. این مطالب جایگزین مقررات رسمی نیستند."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "آموزش‌ها", href: "/articles" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="book" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(ARTICLES.length)} مقاله
            </Badge>
            <Badge tone="brand" icon="clock" className="bg-white/12 text-white ring-white/25">
              مجموع {toFaDigits(totalMinutes)} دقیقه مطالعه
            </Badge>
            <Badge tone="brand" icon="layers" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(ARTICLE_CATEGORIES.length)} دسته‌بندی
            </Badge>
          </>
        }
      />

      <Section>
        <SectionHeading
          align="start"
          eyebrow="پیشنهاد شروع"
          icon="sparkles"
          title="از این دو راهنما شروع کنید"
          description="شایسته‌ترین مطالب برای شروع: آشنایی با کارت بهداشت و آماده‌سازی مدارک پیش از مراجعه."
          action={
            <ButtonLink href="#all-articles" variant="outline" icon="arrowLeft">
              فهرست کامل مقالات
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featured.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="wide" />
          ))}
        </div>
      </Section>

      <Section id="all-articles" tone="surface">
        <SectionHeading
          eyebrow="همه مقالات"
          icon="layers"
          title="جست‌وجو و مرور بر اساس دسته‌بندی"
          description={`${fa(ARTICLES.length)} مقاله آموزشی در ${fa(ARTICLE_CATEGORIES.length)} دسته‌بندی؛ می‌توانید بر اساس موضوع جست‌وجو کنید یا دسته‌بندی دلخواه را انتخاب کنید.`}
        />
        <div className="mt-10">
          <ArticleExplorer articles={ARTICLES} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="دسته‌بندی بر اساس خدمت"
          icon="services"
          title="راهنمای مرتبط با هر خدمت"
          description="هر خدمت راهنمای اختصاصی خود را دارد؛ از این بخش سریع‌تر به مطالب مرتبط برسید."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.slug} className="surface-card lift p-5">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ${service.gradient}`}>
                  <span aria-hidden>{service.emoji}</span>
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-black text-ink-900 dark:text-white">{service.title}</h3>
                  <p className="text-[0.7rem] text-ink-500 dark:text-ink-400">
                    {fa(ARTICLES.filter((a) => a.relatedServices.includes(service.slug)).length)} مقاله مرتبط
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5">
                {ARTICLES.filter((a) => a.relatedServices.includes(service.slug))
                  .slice(0, 2)
                  .map((article) => (
                    <li key={article.slug}>
                      <ArticleCard article={article} variant="compact" />
                    </li>
                  ))}
              </ul>
              <ButtonLink href={`/services/${service.slug}`} variant="link" size="sm" iconEnd="arrowLeft" className="mt-4">
                صفحه خدمت
              </ButtonLink>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="آماده ثبت درخواست هستید؟"
        description="اگر مدارک و اطلاعات لازم را آماده کرده‌اید، همین حالا درخواست خود را ثبت کنید و کد پیگیری بگیرید."
        secondary={{ href: "/faq", label: "پرسش‌های متداول", icon: "chat" }}
      />
    </>
  );
}
