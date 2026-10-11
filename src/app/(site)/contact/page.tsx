import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/site/contact-form";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Badge, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";
import { jsonLd, pageMetadata, breadcrumbJsonLd, openingHoursText, absolute } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "تماس و موقعیت دفتر",
  description:
    "نشانی، شماره تماس، ساعات کاری و موقعیت مکانی دفتر خدمات سلامت ۴۷۷ قزوین — خیابان طالقانی، برج خلیج فارس، طبقه ششم، واحد ۶۱۹، همراه با مسیریابی و فرم ارتباط.",
  path: "/contact",
  keywords: ["تماس با دفتر", "آدرس", "نقشه", "ساعات کاری", "قزوین"],
});

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "تماس", href: "/contact" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="تماس و موقعیت"
        icon="pin"
        title="راه‌های ارتباط با دفتر"
        description="برای پرسش‌های سریع می‌توانید تماس بگیرید؛ برای ثبت و پیگیری درخواست، استفاده از سامانه آنلاین سریع‌تر است و کد پیگیری اختصاصی می‌دهد."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "تماس", href: "/contact" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="clock" className="bg-white/12 text-white ring-white/25">
              {SITE.hoursSummary}
            </Badge>
            <Badge tone="brand" icon="pin" className="bg-white/12 text-white ring-white/25">
              {SITE.city}
            </Badge>
          </>
        }
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="تلفن همراه" value={toFaDigits(SITE.phones[0].display)} icon="phone" />
          <Metric label="تلفن ثابت" value={toFaDigits(SITE.phones[1].display)} icon="phone" tone="gold" />
          <Metric label="ایمیل رسمی" value={SITE.emailDisplay} icon="mail" tone="info" />
          <Metric label="پیگیری آنلاین" value="۲۴ ساعته" icon="track" tone="success" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="building" size={19} className="text-brand-600 dark:text-brand-400" />
                نشانی دفتر
              </h2>
              <p className="mt-3 text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">{SITE.addressFull}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-[0.78rem] font-black text-white transition hover:bg-brand-700"
                >
                  <Icon name="pin" size={16} />
                  مسیریابی با Google Maps
                </a>
                <a
                  href={SITE.mapProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-4 py-2.5 text-[0.78rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                >
                  <Icon name="globe" size={16} />
                  مشاهده موقعیت
                </a>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="clock" size={19} className="text-brand-600 dark:text-brand-400" />
                ساعات کاری
              </h2>
              <ul className="mt-3 space-y-2">
                {SITE.hours.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-2.5 text-[0.82rem]"
                  >
                    <span className="font-bold text-ink-700 dark:text-ink-200">{row.day}</span>
                    <span className={row.closed ? "font-black text-rose-600 dark:text-rose-400" : "numeric font-black text-ink-900 dark:text-white"}>
                      {row.closed ? "تعطیل" : toFaDigits(row.hours)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.72rem] leading-6 text-ink-500 dark:text-ink-400">
                فرم ثبت درخواست و صفحه پیگیری در همه ساعت‌ها فعال است؛ بررسی درخواست‌ها در ساعات کاری انجام می‌شود.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="chat" size={19} className="text-brand-600 dark:text-brand-400" />
                کانال‌های ارتباطی
              </h2>
              <div className="mt-4 space-y-2">
                {SITE.phones.map((phone) => (
                  <a
                    key={phone.value}
                    href={`tel:${phone.value}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] px-4 py-3 transition hover:border-brand-300"
                  >
                    <span className="flex items-center gap-2 text-[0.8rem] font-bold text-ink-700 dark:text-ink-200">
                      <Icon name="phone" size={16} className="text-brand-600 dark:text-brand-400" />
                      {phone.label}
                    </span>
                    <span className="numeric text-[0.82rem] font-black text-ink-900 dark:text-white">
                      {toFaDigits(phone.display)}
                    </span>
                  </a>
                ))}
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] px-4 py-3 transition hover:border-brand-300"
                >
                  <span className="flex items-center gap-2 text-[0.8rem] font-bold text-ink-700 dark:text-ink-200">
                    <Icon name="mail" size={16} className="text-brand-600 dark:text-brand-400" />
                    ایمیل رسمی
                  </span>
                  <span className="text-[0.8rem] font-black text-ink-900 dark:text-white">{SITE.emailDisplay}</span>
                </a>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {SITE.social.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2 text-[0.74rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                    >
                      <Icon name={social.icon} size={16} />
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] p-5">
                <div>
                  <h2 className="font-black text-ink-900 dark:text-white">موقعیت دفتر روی نقشه</h2>
                  <p className="mt-1 text-[0.74rem] text-ink-500 dark:text-ink-400">
                    برج خلیج فارس، طبقه ششم — نزدیک خیابان طالقانی
                  </p>
                </div>
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl bg-brand-50 px-3.5 py-2 text-[0.72rem] font-black text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/12 dark:text-brand-200"
                >
                  مسیریابی
                </a>
              </div>
              <iframe
                title="نقشه موقعیت دفتر خدمات سلامت ۴۷۷"
                src={SITE.mapEmbedUrl}
                className="h-[26rem] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
                <span>مختصات: {toFaDigits(`${SITE.lat}, ${SITE.lng}`)}</span>
                <span>{openingHoursText()}</span>
              </div>
            </Card>

            <div>
              <SectionHeading
                align="start"
                eyebrow="فرم ارتباط"
                icon="send"
                title="پیام خود را ارسال کنید"
                description="این فرم یک درخواست از نوع «سایر درخواست‌ها» ثبت می‌کند؛ کد پیگیری دریافت می‌کنید و پاسخ کارشناس در همان صفحه قابل مشاهده است."
              />
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title="ثبت درخواست سریع‌تر از تماس است"
        description="برای کارت بهداشت، آموزش، صلاحیت و ممیزی، فرم اختصاصی هر خدمت در دسترس است و کد پیگیری همان لحظه صادر می‌شود."
        secondary={{ href: "/faq", label: "پرسش‌های متداول", icon: "chat" }}
      />
    </>
  );
}
