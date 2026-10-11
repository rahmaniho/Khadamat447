import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Hero } from "@/components/home/hero";
import { StatsBand } from "@/components/home/stats-band";
import { Testimonials } from "@/components/home/testimonials";
import { ServiceCard } from "@/components/services/service-card";
import { ArticleCard } from "@/components/articles/article-card";
import { FaqList } from "@/components/site/faq-list";
import { CheckList, CtaBand, InfoTile, Section } from "@/components/site/section";
import { Badge, ButtonLink, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/overlay";
import { getFaqsForService, getFeaturedServices, SERVICES, ARTICLES, FAQS } from "@/lib/content";
import { FEATURES, PROCESS_STEPS, SITE, TESTIMONIALS, TRUST_POINTS, VALUES } from "@/lib/content/site";
import { pageMetadata, faqJsonLd, jsonLd, openingHoursText } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "دفتر خدمات سلامت ۴۷۷ قزوین | ثبت درخواست آنلاین کارت بهداشت و خدمات بهداشتی",
  description:
    "ثبت و پیگیری آنلاین درخواست کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی در قزوین؛ با کد پیگیری اختصاصی، راهنمای مدارک و پاسخ کارشناس دفتر خدمات سلامت ۴۷۷.",
  path: "/",
});

const MARQUEE = [
  "کارت بهداشت شاغلان صنوف",
  "آموزش بهداشت اصناف",
  "صلاحیت بهداشت واحدها",
  "ممیزی بهداشتی",
  "قراردادهای خدمات سلامت",
  "راهنمای مدارک",
  "پیگیری آنلاین درخواست",
  "پاسخ کارشناس",
];

export default function HomePage() {
  const featured = getFeaturedServices();
  const homeFaqs = FAQS.slice(0, 6);
  const articles = ARTICLES.slice(0, 3);
  const otherServices = SERVICES.filter((s) => !featured.includes(s));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(homeFaqs)) }} />

      <Hero />

      {/* نوار حوزه‌های خدمت */}
      <div className="border-y border-[var(--border-soft)] bg-[var(--surface)] py-4">
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex animate-marquee gap-3 pe-3">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 px-4 py-2 text-[0.74rem] font-black text-ink-600 dark:text-ink-300"
              >
                <Icon name="check" size={13} strokeWidth={3} className="text-brand-600 dark:text-brand-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Section>
        <Reveal>
          <StatsBand />
        </Reveal>
      </Section>

      {/* خدمات */}
      <Section id="services" tone="surface">
        <SectionHeading
          eyebrow="خدمات دفتر"
          icon="services"
          title="خدمات اصلی دفتر خدمات سلامت ۴۷۷"
          description="برای هر خدمت، صفحه‌ای مستقل با توضیح کامل، فهرست مدارک، مراحل انجام کار و فرم اختصاصی ثبت درخواست فراهم شده است."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((service, i) => (
            <Reveal key={service.slug} delay={i * 80}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {otherServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex items-center gap-3 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-4 transition hover:border-brand-300 hover:bg-[var(--surface)] dark:hover:border-brand-400/40"
            >
              <span className="text-2xl" aria-hidden>
                {service.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.84rem] font-black text-ink-800 group-hover:text-brand-700 dark:text-ink-100">
                  {service.title}
                </span>
                <span className="block truncate text-[0.7rem] text-ink-500 dark:text-ink-400">{service.tagline}</span>
              </span>
              <Icon name="chevronLeft" size={16} className="ms-auto shrink-0 text-ink-300 transition group-hover:text-brand-600" />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/services" variant="outline" icon="layers">
            مشاهده صفحه کامل خدمات
          </ButtonLink>
        </div>
      </Section>

      {/* مزایا */}
      <Section>
        <SectionHeading
          eyebrow="چرا سامانه ۴۷۷"
          icon="sparkles"
          title="همه‌چیز شفاف، قابل پیگیری و بدون مراجعه‌های تکراری"
          description="این سامانه تنها قابلیت‌هایی را ارائه می‌کند که واقعاً در دسترس شماست؛ از ثبت درخواست تا اطلاع‌رسانی پایان فرایند."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <InfoTile icon={feature.icon} title={feature.title} tone={feature.tone === "brand" ? "brand" : feature.tone}>
                {feature.text}
              </InfoTile>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* مراحل */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              align="start"
              eyebrow="مدل کار"
              icon="wizard"
              title="چهار گام تا ثبت و پیگیری درخواست"
              description="فرایند به‌گونه‌ای طراحی شده که در هر مرحله بدانید درخواست شما در چه وضعیتی است و چه اقدامی لازم دارد."
            />
            <div className="mt-8">
              <CheckList
                items={[
                  "انتخاب خدمت و نمایش فرم اختصاصی همان خدمت",
                  "بارگذاری اختیاری مدارک با کنترل قالب و حجم",
                  "صدور کد پیگیری یکتا و ذخیره آن در کارتابل من",
                  "اطلاع‌رسانی خودکار در هر تغییر وضعیت",
                ]}
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/request" icon="send">
                ثبت درخواست
              </ButtonLink>
              <ButtonLink href="/track" variant="outline" icon="track">
                پیگیری درخواست موجود
              </ButtonLink>
            </div>
          </div>

          <ol className="relative space-y-4">
            <span className="absolute inset-y-6 start-[1.6rem] w-px bg-gradient-to-b from-brand-400/60 via-brand-300/30 to-transparent" aria-hidden />
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <li className="surface-card relative flex gap-4 p-5">
                  <span className="relative z-10 grid h-13 w-13 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-glow" style={{ height: "3.25rem", width: "3.25rem" }}>
                    <Icon name={step.icon} size={24} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-ink-900 dark:text-white">{step.title}</h3>
                      <Badge tone="slate" size="sm">
                        {toFaDigits(i + 1)} · {step.duration}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* اعتماد و حریم خصوصی */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="surface-card relative overflow-hidden p-7 md:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-500/10" aria-hidden />
            <Badge tone="brand" icon="lock">
              حریم خصوصی و امنیت
            </Badge>
            <h2 className="relative mt-5 text-xl font-black leading-9 text-ink-900 md:text-2xl dark:text-white">
              اطلاعات شما فقط برای همان درخواست استفاده می‌شود
            </h2>
            <p className="relative mt-3 text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">
              در فرم‌های عمومی کد ملی دریافت نمی‌شود، مدارک در فضای خصوصی نگهداری می‌شوند و دسترسی کارکنان به مدارک ثبت
              می‌شود. متن کامل تعهدات در صفحه حریم خصوصی آمده است.
            </p>
            <div className="relative mt-6">
              <CheckList items={TRUST_POINTS} />
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/privacy" variant="outline" size="sm" icon="shieldCheck">
                مطالعه سیاست حریم خصوصی
              </ButtonLink>
              <ButtonLink href="/status" variant="ghost" size="sm" icon="activity">
                وضعیت سامانه
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <div key={value.title} className="surface-card lift p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon name={value.icon} size={21} />
                  </span>
                  <h3 className="mt-4 font-black text-ink-900 dark:text-white">{value.title}</h3>
                  <p className="mt-1.5 text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">{value.text}</p>
                </div>
              ))}
            </div>

            <div className="surface-card bg-gradient-to-bl from-brand-800 to-brand-950 p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/20">
                  <Icon name="phone" size={22} />
                </span>
                <div>
                  <p className="text-[0.72rem] font-bold text-white/70">تماس مستقیم با دفتر</p>
                  <p className="numeric text-lg font-black">{toFaDigits(SITE.phones[0].display)}</p>
                </div>
              </div>
              <p className="mt-4 text-[0.78rem] leading-7 text-white/80">
                {openingHoursText()} — نشانی: {SITE.addressFull}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href={`tel:${SITE.phones[0].value}`} variant="light" size="sm" icon="phone">
                  تماس تلفنی
                </ButtonLink>
                <ButtonLink
                  href={SITE.mapUrl}
                  size="sm"
                  icon="pin"
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
                  مسیریابی
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* نظرات */}
      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <SectionHeading
            align="start"
            eyebrow="تجربه مراجعان"
            icon="quote"
            title="آنچه مراجعان درباره دفتر می‌گویند"
            description={`مجموع ${toFaDigits(TESTIMONIALS.length)} نظر ثبت‌شده از مراجعان درباره خدمات مختلف دفتر؛ نظرات صرفاً تجربه شخصی افراد است و تعهدی ایجاد نمی‌کند.`}
          />
          <Testimonials />
        </div>
      </Section>

      {/* پرسش‌ها */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div>
            <SectionHeading
              align="start"
              eyebrow="پرسش‌های پرتکرار"
              icon="chat"
              title="پرسش‌های متداول درباره خدمات"
              description="اگر پاسخ پرسش خود را نیافتید، از طریق فرم «سایر درخواست‌ها» موضوع را برای کارشناس دفتر ارسال کنید."
            />
            <div className="mt-8">
              <FaqList items={homeFaqs} withCategories={false} />
            </div>
            <div className="mt-6">
              <ButtonLink href="/faq" variant="outline" icon="arrowLeft">
                مشاهده همه {toFaDigits(FAQS.length)} پرسش
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="surface-card p-6">
              <h3 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="services" size={19} className="text-brand-600 dark:text-brand-400" />
                پرسش‌های مرتبط با هر خدمت
              </h3>
              <ul className="mt-4 space-y-2">
                {SERVICES.slice(0, 4).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}#faq`}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[0.8rem] font-bold text-ink-700 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-200 dark:hover:bg-brand-500/10"
                    >
                      <span aria-hidden>{service.emoji}</span>
                      <span className="min-w-0 flex-1 truncate">{service.title}</span>
                      <span className="numeric shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[0.64rem] font-black text-ink-500 dark:text-ink-400">
                        {toFaDigits(getFaqsForService(service.slug).length)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card border-dashed p-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gold-50 text-gold-600 dark:bg-gold-500/12 dark:text-gold-300">
                <Icon name="chat" size={26} />
              </span>
              <h3 className="mt-4 font-black text-ink-900 dark:text-white">پاسخ پرسش خود را نیافتید؟</h3>
              <p className="mt-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
                موضوع را از طریق فرم «سایر درخواست‌ها» ارسال کنید تا کارشناس دفتر در ساعات کاری پاسخ دهد.
              </p>
              <ButtonLink href="/request?service=other" size="sm" icon="send" className="mt-4" full>
                ارسال پرسش به کارشناس
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* مقالات */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="آموزش و راهنما"
          icon="book"
          title="راهنماهای کاربردی برای آماده‌سازی مدارک"
          description="مطالب آموزشی درباره کارت بهداشت، آموزش اصناف، صلاحیت بهداشت و ممیزی — با زبان ساده و قابل استناد."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/articles" variant="outline" icon="book">
            همه مقالات و راهنماها
          </ButtonLink>
        </div>
      </Section>

      <CtaBand
        title="درخواست خود را همین حالا ثبت کنید"
        description="فرم‌ها در هر ساعت از شبانه‌روز در دسترس است. خدمت موردنظر خود را انتخاب کنید، اطلاعات ضروری را وارد کنید و کد پیگیری دریافت کنید."
        secondary={{ href: "/guide", label: "راهنمای گام‌به‌گام", icon: "book2" }}
        note="ثبت درخواست آنلاین به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست."
      />
    </>
  );
}
