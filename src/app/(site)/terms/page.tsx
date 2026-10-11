import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Alert, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";
import { pageMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "شرایط استفاده",
  description:
    "شرایط استفاده از سامانه دفتر خدمات سلامت ۴۷۷: ماهیت ثبت درخواست آنلاین، مسئولیت صحت اطلاعات، محتوای آموزشی و قواعد استفاده از سایت.",
  path: "/terms",
  keywords: ["شرایط استفاده", "قوانین سایت", "ماهیت ثبت درخواست"],
});

const SECTIONS = [
  {
    id: "nature",
    title: "ماهیت ثبت درخواست آنلاین",
    icon: "info",
    points: [
      "ثبت درخواست در این سامانه به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست.",
      "نتیجه هر درخواست پس از بررسی کارشناسی و طی مراحل قانونی اعلام می‌شود.",
      "زمان‌های تقریبی اعلام‌شده (مانند «۱ تا ۳ روز کاری») تخمینی است و ممکن است بسته به مورد تغییر کند.",
      "در صورت نیاز به حضور، زمان مراجعه از طریق کانال ارتباطی انتخاب‌شده شما هماهنگ می‌شود.",
    ],
    tone: "warning" as const,
  },
  {
    id: "accuracy",
    title: "صحت اطلاعات و مدارک",
    icon: "edit",
    points: [
      "مسئولیت صحت اطلاعات وارد‌شده و اصالت مدارک ارسالی بر عهده متقاضی است.",
      "اطلاعات نادرست یا ناقص می‌تواند موجب توقف رسیدگی یا اعلام نتیجه نادرست شود.",
      "بارگذاری مدارک متعلق به دیگران بدون رضایت آن‌ها مجاز نیست.",
      "در صورت تغییر اطلاعات تماس، لازم است تغییر را به دفتر اطلاع دهید تا اطلاع‌رسانی قطع نشود.",
    ],
  },
  {
    id: "content",
    title: "محتوای آموزشی سایت",
    icon: "book",
    points: [
      "مطالب آموزشی و راهنماها با هدف ساده‌سازی فرایند نوشته شده‌اند.",
      "این مطالب جایگزین مقررات رسمی، بخشنامه‌ها یا نظر کارشناس ذی‌صلاح نیست.",
      "فهرست مدارک هر خدمت به‌صورت «راهنما» ارائه می‌شود و ممکن است بر اساس مورد شما تغییر کند.",
      "به‌روزرسانی محتوا در صورت تغییر روال‌ها انجام می‌شود؛ تاریخ هر مطلب در صفحه آن درج شده است.",
    ],
  },
  {
    id: "usage",
    title: "قواعد استفاده از سامانه",
    icon: "shield",
    points: [
      "استفاده از سامانه برای ارسال درخواست‌های مرتبط با خدمات دفتر مجاز است.",
      "ارسال انبوه، خودکار یا مخرب درخواست‌ها باعث محدودیت دسترسی خواهد شد.",
      "تلاش برای دسترسی به درخواست‌های دیگران با کد پیگیری جعلی یا روش‌های غیرمجاز پیگرد قانونی دارد.",
      "سامانه ممکن است برای به‌روزرسانی موقتاً در دسترس نباشد؛ وضعیت سرویس‌ها در صفحه «وضعیت سامانه» اعلام می‌شود.",
    ],
  },
  {
    id: "liability",
    title: "محدودیت مسئولیت",
    icon: "scale",
    points: [
      "دفتر مسئول خسارات ناشی از ورود اطلاعات نادرست توسط کاربر نیست.",
      "تأخیر ناشی از اختلال سرویس‌های پیامکی یا ایمیلی خارج از کنترل دفتر است؛ پیام‌های ارسال‌نشده در صف ارسال مجدد قرار می‌گیرند.",
      "در صورت قطعی سامانه، امکان ارائه درخواست به‌صورت حضوری یا تلفنی وجود دارد.",
    ],
  },
  {
    id: "changes",
    title: "تغییرات در شرایط استفاده",
    icon: "refresh",
    points: [
      "دفتر می‌تواند این شرایط و متن خدمات را به‌روزرسانی کند.",
      "تاریخ آخرین به‌روزرسانی در همین صفحه درج می‌شود.",
      "استفاده مستمر از سامانه به معنی پذیرش نسخه به‌روز شرایط است.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "شرایط استفاده", href: "/terms" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="شرایط استفاده"
        icon="file"
        title="شرایط استفاده از سامانه"
        description="این صفحه قواعد استفاده از سامانه، ماهیت ثبت درخواست آنلاین و مسئولیت‌های متقاضی را توضیح می‌دهد. پیش از ارسال درخواست، آن را بخوانید."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "شرایط استفاده", href: "/terms" },
        ]}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="ثبت درخواست" value="به معنی تأیید نهایی نیست" icon="alert" tone="gold" />
          <Metric label="مسئولیت اطلاعات" value="بر عهده متقاضی" icon="user" />
          <Metric label="آخرین به‌روزرسانی" value={formatDate("2026-09-01T00:00:00.000Z", "medium")} icon="refresh" tone="info" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[0.86rem] font-black text-ink-900 dark:text-white">
                <Icon name="layers" size={17} className="text-brand-600 dark:text-brand-400" />
                فهرست بندها
              </h2>
              <ol className="mt-3 space-y-1.5">
                {SECTIONS.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-[0.76rem] font-bold text-ink-600 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-300 dark:hover:bg-brand-500/10"
                    >
                      <span className="mt-0.5 shrink-0 text-ink-400">{toFaDigits(index + 1)}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="mt-4 space-y-2 p-5">
              <h2 className="text-[0.86rem] font-black text-ink-900 dark:text-white">پرسشی درباره شرایط دارید؟</h2>
              <a
                href={`tel:${SITE.phones[0].value}`}
                className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-[0.78rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
              >
                <Icon name="phone" size={15} className="text-brand-600 dark:text-brand-400" />
                <span className="numeric">{toFaDigits(SITE.phones[0].display)}</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-[0.78rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
              >
                <Icon name="mail" size={15} className="text-brand-600 dark:text-brand-400" />
                {SITE.emailDisplay}
              </a>
            </Card>
          </aside>

          <div className="space-y-8">
            <Alert tone="warning" icon="alert" title="مهم‌ترین بند">
              ثبت درخواست آنلاین به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست؛ نتیجه تنها پس از بررسی
              کارشناسی و طی مراحل قانونی اعلام می‌شود.
            </Alert>

            {SECTIONS.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon name={section.icon} size={19} />
                  </span>
                  <h2 className="text-xl font-black text-ink-900 dark:text-white">
                    {toFaDigits(index + 1)}. {section.title}
                  </h2>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[0.86rem] leading-8 text-ink-700 dark:text-ink-200">
                      <Icon name="dot" size={14} className="mt-2.5 shrink-0 text-brand-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <SectionHeading
              align="start"
              eyebrow=""
              icon="shieldCheck"
              title="پذیرش شرایط"
              description="با ارسال درخواست در سامانه، تأیید می‌کنید که این شرایط و سیاست حریم خصوصی را خوانده‌اید و اطلاعات وارد‌شده صحیح است."
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-[0.82rem] font-black text-white transition hover:bg-brand-700"
              >
                <Icon name="lock" size={17} />
                مطالعه حریم خصوصی
              </Link>
              <Link
                href="/request"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-4 py-3 text-[0.82rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
              >
                <Icon name="send" size={17} />
                شروع ثبت درخواست
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title="همه‌چیز روشن است؟"
        description="درخواست خود را ثبت کنید؛ در پایان کد پیگیری اختصاصی دریافت می‌کنید و وضعیت را آنلاین دنبال می‌کنید."
        secondary={{ href: "/guide", label: "راهنمای استفاده", icon: "book2" }}
      />
    </>
  );
}
