import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { ServiceDetailTabs } from "@/components/services/service-detail-tabs";
import { ArticleCard } from "@/components/articles/article-card";
import { FaqList } from "@/components/site/faq-list";
import { CheckList, CtaBand, Section } from "@/components/site/section";
import { Badge, ButtonLink, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/overlay";
import { ARTICLES, SERVICES, getFaqsForService, getService } from "@/lib/content";
import { SITE } from "@/lib/content/site";
import { breadcrumbJsonLd, jsonLd, pageMetadata, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";
import { stripMarkdown } from "@/lib/format";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return pageMetadata({ title: "خدمت یافت نشد", description: "", path: `/services/${slug}`, noindex: true });
  return pageMetadata({
    title: service.seoTitle.replace(" - دفتر خدمات سلامت ۴۷۷", ""),
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    keywords: service.tags,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const faqs = getFaqsForService(service.slug);
  const related = ARTICLES.filter((a) => a.relatedServices.includes(service.slug)).slice(0, 3);
  const others = SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({ name: service.title, description: service.summary, slug: service.slug }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "خدمات", href: "/services" },
              { name: service.title, href: `/services/${service.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />

      {/* سرصفحه خدمت */}
      <section className={cn("relative overflow-hidden bg-gradient-to-bl text-white", service.gradient, "bg-gradient-to-bl")}>
        <div className="absolute inset-0 bg-ink-950/35" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/15 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-14">
          <nav aria-label="مسیر صفحه" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.72rem] font-bold text-white/70">
              <li>
                <Link href="/" className="transition hover:text-white">
                  خانه
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="chevronLeft" size={13} className="text-white/40" />
                <Link href="/services" className="transition hover:text-white">
                  خدمات
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="chevronLeft" size={13} className="text-white/40" />
                <span className="text-white">{service.title}</span>
              </li>
            </ol>
          </nav>

          <div className="grid gap-9 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge tone="brand" className="bg-white/15 text-white ring-white/25" icon={service.icon}>
                  خدمت فعال
                </Badge>
                {service.popular && (
                  <Badge tone="brand" className="bg-gold-400/25 text-white ring-white/25" icon="sparkles">
                    پرمراجعه
                  </Badge>
                )}
                <Badge tone="brand" className="bg-white/10 text-white ring-white/20" icon="clipboard">
                  {toFaDigits(service.fields.length)} فیلد اختصاصی
                </Badge>
              </div>

              <h1 className="mt-5 text-2xl font-black leading-[1.5] md:text-4xl">{service.title}</h1>
              <p className="mt-4 max-w-2xl text-[0.96rem] leading-9 text-white/90">{service.summary}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/request?service=${service.slug}`} variant="light" size="lg" icon="send">
                  شروع ثبت درخواست
                </ButtonLink>
                <ButtonLink
                  href="#documents"
                  size="lg"
                  variant="outline"
                  icon="clipboard"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
                  فهرست مدارک
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-4xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <h2 className="text-[0.9rem] font-black">نکات کلیدی این خدمت</h2>
              <ul className="mt-4 space-y-2.5">
                {service.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.8rem] leading-7 text-white/90">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                      <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-[0.72rem] font-bold">
                <div>
                  <p className="text-white/60">زمان تقریبی بررسی</p>
                  <p className="mt-1 text-[0.86rem] font-black">{service.duration}</p>
                </div>
                <div>
                  <p className="text-white/60">حداکثر مدارک</p>
                  <p className="mt-1 text-[0.86rem] font-black">{toFaDigits(service.maxAttachments)} فایل</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* شاخص‌های سریع */}
      <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="خدمت" value={service.title} icon={service.icon} />
          <Metric label="مخاطب" value={service.audienceLabel || "متقاضیان خدمت"} icon="users" tone="gold" />
          <Metric label="پرسش‌های مرتبط" value={`${toFaDigits(faqs.length)} پرسش`} icon="chat" tone="info" />
          <Metric label="کد پیگیری" value="یکتا برای هر درخواست" icon="track" tone="success" />
        </div>
      </div>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:items-start">
          <div id="documents">
            <ServiceDetailTabs service={service} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <Card className="space-y-4">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="inbox" size={19} className="text-brand-600 dark:text-brand-400" />
                خلاصه خدمت
              </h2>
              <dl className="space-y-2 text-[0.78rem]">
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
                  <dt className="font-bold text-ink-500 dark:text-ink-400">زمان بررسی</dt>
                  <dd className="font-black text-ink-800 dark:text-ink-100">{service.duration}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
                  <dt className="font-bold text-ink-500 dark:text-ink-400">حداکثر فایل</dt>
                  <dd className="font-black text-ink-800 dark:text-ink-100">{toFaDigits(service.maxAttachments)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
                  <dt className="font-bold text-ink-500 dark:text-ink-400">نوع فرم</dt>
                  <dd className="font-black text-ink-800 dark:text-ink-100">اختصاصی این خدمت</dd>
                </div>
              </dl>
              <ButtonLink href={`/request?service=${service.slug}`} icon="send" full>
                ثبت درخواست این خدمت
              </ButtonLink>
              <ButtonLink
                href={`tel:${SITE.phones[0].value}`}
                variant="outline"
                icon="phone"
                full
              >
                پرسش تلفنی: {toFaDigits(SITE.phones[0].display)}
              </ButtonLink>
            </Card>

            <Card className="space-y-3 bg-[var(--surface-muted)]/60">
              <h3 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="alert" size={18} className="text-amber-600 dark:text-amber-400" />
                نکته مهم
              </h3>
              <p className="text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">
                ثبت درخواست آنلاین به معنی تأیید نهایی یا صدور مجوز نیست. نتیجه پس از بررسی کارشناسی و طی مراحل قانونی
                اعلام می‌شود.
              </p>
            </Card>

            <Card className="space-y-3">
              <h3 className="font-black text-ink-900 dark:text-white">سایر خدمات</h3>
              <ul className="space-y-1.5">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/services/${item.slug}`}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[0.78rem] font-bold text-ink-700 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-200 dark:hover:bg-brand-500/10"
                    >
                      <span aria-hidden>{item.emoji}</span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <Icon name="chevronLeft" size={15} className="shrink-0 text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </Section>

      {/* پرسش‌های مرتبط */}
      <Section id="faq" tone="surface">
        <SectionHeading
          eyebrow="پرسش‌های مرتبط"
          icon="chat"
          title={`پرسش‌های متداول «${service.title}»`}
          description="پرسش‌های عمومی دفتر که بیشترین ارتباط را با این خدمت دارند. برای پرسش‌های بیشتر، صفحه پرسش‌های متداول را ببینید."
        />
        <div className="mx-auto mt-10 max-w-4xl">
          <FaqList items={faqs} withCategories={false} />
        </div>
      </Section>

      {/* مقالات مرتبط */}
      {related.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="آموزش مرتبط"
            icon="book"
            title="راهنماهای مرتبط با این خدمت"
            description="مطالب آموزشی که آماده‌سازی مدارک و درک بهتر فرایند را ساده‌تر می‌کند."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((article, i) => (
              <Reveal key={article.slug} delay={i * 80}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* خلاصه متن برای موتورهای جست‌وجو و دستیارهای هوشمند */}
      <Section>
        <div className="surface-card mx-auto max-w-4xl p-6 md:p-8">
          <Badge tone="brand" icon="sparkles">
            خلاصه خوانا برای جست‌وجوگرها
          </Badge>
          <h2 className="mt-4 text-lg font-black text-ink-900 dark:text-white">در یک نگاه</h2>
          <p className="mt-3 text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">{stripMarkdown(service.intro)}</p>
          <div className="mt-5">
            <CheckList columns={2} items={service.highlights} />
          </div>
        </div>
      </Section>

      <CtaBand
        title={`درخواست «${service.title}» را ثبت کنید`}
        description="اطلاعات ضروری را در چند گام وارد کنید، در صورت داشتن مدارک آن‌ها را بارگذاری کنید و کد پیگیری دریافت کنید."
        secondary={{ href: "/track", label: "پیگیری درخواست موجود", icon: "track" }}
      />
    </>
  );
}
