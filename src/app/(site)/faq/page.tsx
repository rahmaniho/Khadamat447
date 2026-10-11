import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { FaqList } from "@/components/site/faq-list";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Badge, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { FAQS, FAQ_CATEGORIES } from "@/lib/content";
import { SITE } from "@/lib/content/site";
import { faqJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "پرسش‌های متداول",
  description:
    "پاسخ پرسش‌های متداول درباره کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت، مدارک لازم، زمان بررسی و نحوه پیگیری درخواست در دفتر خدمات سلامت ۴۷۷ قزوین.",
  path: "/faq",
  keywords: ["سوالات متداول", "کارت بهداشت", "مدارک", "پیگیری درخواست"],
});

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(FAQS)) }} />

      <PageHero
        eyebrow="پرسش‌های متداول"
        icon="chat"
        title="پاسخ پرسش‌های پرتکرار"
        description="پاسخ‌ها بر اساس روال فعلی دفتر نوشته شده‌اند. اگر پاسخ پرسش شما این‌جا نیست، می‌توانید آن را از طریق فرم «سایر درخواست‌ها» بپرسید."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "پرسش‌های متداول", href: "/faq" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="chat" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(FAQS.length)} پرسش
            </Badge>
            <Badge tone="brand" icon="layers" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(FAQ_CATEGORIES.length)} دسته‌بندی
            </Badge>
          </>
        }
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="زمان پاسخ‌دهی" value="در ساعات کاری" icon="clock" />
          <Metric label="کانال پاسخ" value="پیامک، ایمیل یا تماس" icon="chat" tone="gold" />
          <Metric label="پرسش موردی" value="فرم «سایر درخواست‌ها»" icon="send" tone="info" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <FaqList items={FAQS} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <Card className="space-y-3">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="send" size={19} className="text-brand-600 dark:text-brand-400" />
                پرسش خود را بپرسید
              </h2>
              <p className="text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
                اگر پاسخ پرسش‌تان در فهرست نبود، موضوع را از فرم «سایر درخواست‌ها» ارسال کنید؛ کارشناس دفتر در ساعات کاری
                پاسخ می‌دهد و پاسخ از طریق کد پیگیری قابل مشاهده است.
              </p>
              <Link
                href="/request?service=other"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-[0.82rem] font-black text-white transition hover:bg-brand-700"
              >
                <Icon name="chat" size={17} />
                ارسال پرسش به کارشناس
              </Link>
            </Card>

            <Card className="space-y-3">
              <h2 className="font-black text-ink-900 dark:text-white">دسته‌بندی پرسش‌ها</h2>
              <ul className="space-y-2">
                {FAQ_CATEGORIES.map((category) => (
                  <li
                    key={category}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5"
                  >
                    <span className="text-[0.78rem] font-bold text-ink-700 dark:text-ink-200">{category}</span>
                    <span className="numeric rounded-full bg-white px-2 py-0.5 text-[0.66rem] font-black text-brand-700 dark:bg-white/10 dark:text-brand-200">
                      {toFaDigits(FAQS.filter((f) => f.category === category).length)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-3">
              <h2 className="font-black text-ink-900 dark:text-white">تماس مستقیم</h2>
              <div className="space-y-2 text-[0.8rem] font-bold">
                {SITE.phones.map((phone) => (
                  <a
                    key={phone.value}
                    href={`tel:${phone.value}`}
                    className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                  >
                    <Icon name="phone" size={16} className="text-brand-600 dark:text-brand-400" />
                    <span className="numeric">{toFaDigits(phone.display)}</span>
                  </a>
                ))}
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                >
                  <Icon name="mail" size={16} className="text-brand-600 dark:text-brand-400" />
                  {SITE.emailDisplay}
                </a>
              </div>
              <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">{SITE.hoursSummary}</p>
            </Card>
          </aside>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="دسترسی سریع"
          icon="services"
          title="اگر پرسش شما درباره یک خدمت خاص است"
          description="در صفحه هر خدمت، پرسش‌های مرتبط و فهرست مدارک همان خدمت نمایش داده می‌شود."
        />
      </Section>

      <CtaBand
        title="پاسخ پرسش‌تان را پیدا نکردید؟"
        description="موضوع را برای کارشناس دفتر ارسال کنید یا با شماره‌های تماس در ساعات کاری تماس بگیرید."
        primary={{ href: "/request?service=other", label: "ارسال پرسش به کارشناس", icon: "chat" }}
        secondary={{ href: "/contact", label: "اطلاعات تماس و نشانی", icon: "pin" }}
      />
    </>
  );
}
