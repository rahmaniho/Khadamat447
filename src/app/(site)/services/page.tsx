import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ServicesShowcase } from "@/components/services/services-showcase";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Badge, ButtonLink, Card, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/overlay";
import { SERVICES } from "@/lib/content";
import { FAQS } from "@/lib/content";
import { pageMetadata, jsonLd, serviceJsonLd } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "خدمات دفتر خدمات سلامت ۴۷۷",
  description:
    "فهرست خدمات دفتر خدمات سلامت ۴۷۷ قزوین: کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت، ممیزی و قراردادها، و سایر درخواست‌ها — همراه با فرم اختصاصی هر خدمت.",
  path: "/services",
  keywords: ["خدمات سلامت", "کارت بهداشت", "آموزش بهداشت اصناف", "صلاحیت بهداشت", "ممیزی بهداشتی", "قزوین"],
});

const COMPARISON = [
  { title: "زمان تقریبی بررسی", key: "duration" as const },
  { title: "مخاطب اصلی", key: "audienceLabel" as const },
];

export default function ServicesPage() {
  return (
    <>
      {SERVICES.map((service) => (
        <script
          key={service.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              serviceJsonLd({ name: service.title, description: service.summary, slug: service.slug }),
            ),
          }}
        />
      ))}

      <PageHero
        eyebrow="خدمات دفتر"
        icon="services"
        title="خدمات سلامت، بهداشت و ایمنی"
        description="برای هر خدمت، صفحه‌ای مستقل با توضیح کامل، مخاطبان، مراحل انجام کار، فهرست مدارک و فرم اختصاصی ثبت درخواست در دسترس است."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "خدمات", href: "/services" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="services" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(SERVICES.length)} خدمت فعال
            </Badge>
            <Badge tone="brand" icon="clipboard" className="bg-white/12 text-white ring-white/25">
              فرم اختصاصی هر خدمت
            </Badge>
            <Badge tone="brand" icon="chat" className="bg-white/12 ring-white/25 text-white">
              {toFaDigits(FAQS.length)} پرسش متداول
            </Badge>
          </>
        }
      />

      <Section>
        <ServicesShowcase services={SERVICES} searchable />
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="مقایسه سریع"
          icon="layers"
          title="کدام خدمت مناسب شماست؟"
          description="جدول زیر به شما کمک می‌کند در یک نگاه، خدمت مناسب و زمان تقریبی بررسی آن را پیدا کنید."
        />

        <div className="surface-card mt-10 overflow-x-auto p-0">
          <table className="w-full min-w-[46rem] border-collapse text-start">
            <thead>
              <tr className="bg-[var(--surface-muted)]">
                <th className="p-4 text-start text-[0.78rem] font-black text-ink-700 dark:text-ink-200">خدمت</th>
                {COMPARISON.map((column) => (
                  <th key={column.title} className="p-4 text-start text-[0.78rem] font-black text-ink-700 dark:text-ink-200">
                    {column.title}
                  </th>
                ))}
                <th className="p-4 text-start text-[0.78rem] font-black text-ink-700 dark:text-ink-200">فرم</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((service) => (
                <tr key={service.slug} className="border-t border-[var(--border-soft)] transition hover:bg-brand-50/40 dark:hover:bg-white/5">
                  <td className="p-4">
                    <span className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden>
                        {service.emoji}
                      </span>
                      <span>
                        <Link href={`/services/${service.slug}`} className="block text-[0.84rem] font-black text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">
                          {service.title}
                        </Link>
                        <span className="text-[0.7rem] text-ink-500 dark:text-ink-400">{service.tagline}</span>
                      </span>
                    </span>
                  </td>
                  <td className="p-4 text-[0.78rem] font-bold text-ink-600 dark:text-ink-300">{service.duration}</td>
                  <td className="p-4 text-[0.78rem] font-bold text-ink-600 dark:text-ink-300">{service.audienceLabel}</td>
                  <td className="p-4">
                    <Link
                      href={`/request?service=${service.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-[0.72rem] font-black text-brand-700 transition hover:bg-brand-600 hover:text-white dark:bg-brand-500/12 dark:text-brand-200"
                    >
                      <Icon name="send" size={14} />
                      ثبت درخواست
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: "user", title: "نمی‌دانید کدام خدمت؟", text: "گزینه «سایر درخواست‌ها» را انتخاب کنید و موضوع را توضیح دهید.", href: "/request?service=other", link: "ارسال پرسش" },
            { icon: "book2", title: "راهنمای گام‌به‌گام", text: "توضیح کامل مراحل از انتخاب خدمت تا اعلام نتیجه.", href: "/guide", link: "مشاهده راهنما" },
            { icon: "chat", title: "پرسش‌های متداول", text: "پاسخ پرتکرارترین پرسش‌ها درباره مدارک، زمان و پیگیری.", href: "/faq", link: "مشاهده پرسش‌ها" },
          ].map((item) => (
            <Reveal key={item.title}>
              <Card className="flex h-full flex-col p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon name={item.icon} size={21} />
                </span>
                <h3 className="mt-4 font-black text-ink-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{item.text}</p>
                <ButtonLink href={item.href} variant="link" size="sm" iconEnd="arrowLeft" className="mt-3 self-start">
                  {item.link}
                </ButtonLink>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="خدمت موردنظر را انتخاب کرده‌اید؟"
        description="با انتخاب خدمت، فرم اختصاصی همان خدمت باز می‌شود و در پایان کد پیگیری یکتا دریافت می‌کنید."
        secondary={{ href: "/guide", label: "راهنمای ثبت درخواست", icon: "book2" }}
      />
    </>
  );
}
