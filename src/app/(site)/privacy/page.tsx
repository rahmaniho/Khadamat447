import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Alert, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { SITE } from "@/lib/content/site";
import { pageMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "سیاست حریم خصوصی",
  description:
    "توضیح شفاف درباره اطلاعاتی که در سامانه دفتر خدمات سلامت ۴۷۷ جمع‌آوری می‌شود، نحوه نگهداری، مدت نگه‌داری و حقوق شما برای حذف یا دریافت اطلاعات.",
  path: "/privacy",
  keywords: ["حریم خصوصی", "اطلاعات شخصی", "امنیت داده"],
});

const SECTIONS = [
  {
    id: "collect",
    title: "چه اطلاعاتی جمع‌آوری می‌شود؟",
    icon: "clipboard",
    items: [
      "نام و نام خانوادگی، شماره همراه و در صورت تمایل ایمیل",
      "نوع متقاضی (شخص حقیقی یا واحد صنفی) و نام محل فعالیت",
      "پاسخ فیلدهای اختصاصی خدمت انتخابی و توضیحات اختیاری",
      "مدارکی که خودتان بارگذاری می‌کنید (اختیاری)",
      "سابقه رویدادهای درخواست، شامل زمان و نوع تغییر وضعیت",
    ],
    note: "کد ملی، اطلاعات حساب بانکی و اطلاعات پزشکی در فرم‌های عمومی دریافت نمی‌شود.",
  },
  {
    id: "purpose",
    title: "این اطلاعات برای چه استفاده می‌شود؟",
    icon: "target",
    items: [
      "بررسی و رسیدگی به همان درخواست",
      "اطلاع‌رسانی تغییر وضعیت و اعلام نتیجه از کانال انتخابی شما",
      "پاسخ به پرسش‌ها و هماهنگی مراجعه در صورت نیاز",
      "تهیه گزارش‌های آماری بدون هویت (تعداد درخواست‌ها و زمان پاسخ‌دهی)",
    ],
    note: "اطلاعات شما برای بازاریابی استفاده نمی‌شود و در اختیار اشخاص ثالث قرار نمی‌گیرد.",
  },
  {
    id: "documents",
    title: "مدارک بارگذاری‌شده",
    icon: "lock",
    items: [
      "مدارک در فضای ذخیره‌سازی خصوصی و جدا از بخش عمومی سایت نگهداری می‌شود",
      "دسترسی به فایل‌ها فقط برای کارکنان مجاز تعریف شده است",
      "هر مشاهده مدرک توسط کارکنان در سابقه رویدادها ثبت می‌شود",
      "مدارک هرگز از طریق ایمیل یا پیام‌رسان ارسال نمی‌شود",
      "می‌توانید بدون بارگذاری فایل، درخواست خود را ارسال کنید",
    ],
  },
  {
    id: "retention",
    title: "مدت نگه‌داری و حذف اطلاعات",
    icon: "archive",
    items: [
      "اطلاعات هر درخواست تا پایان فرایند رسیدگی و مدت محدود پس از آن نگه‌داری می‌شود",
      "برای حذف یا دریافت نسخه‌ای از اطلاعات خود می‌توانید با دفتر تماس بگیرید",
      "حذف اطلاعات ممکن است پس از طی فرایند اداری مرتبط انجام شود",
      "پس از حذف، امکان بازیابی اطلاعات وجود نخواهد داشت",
    ],
    note: `متن دقیق مدت نگه‌داری پس از بررسی حقوقی اعلام می‌شود. برای درخواست حذف با شماره ${SITE.phones[0].display} تماس بگیرید.`,
  },
  {
    id: "security",
    title: "امنیت اطلاعات",
    icon: "shieldCheck",
    items: [
      "ارتباط با سایت روی پروتکل امن (HTTPS) انجام می‌شود",
      "دسترسی کارکنان به بخش‌های مختلف بر اساس نقش تعریف شده است",
      "فعالیت‌های مدیریتی و دسترسی به مدارک در سابقه رویدادها ثبت می‌شود",
      "دسترسی‌های غیرمجاز محدود و تلاش‌های ناموفق ورود ثبت می‌گردند",
    ],
  },
  {
    id: "rights",
    title: "حقوق شما",
    icon: "user",
    items: [
      "مشاهده اطلاعات ثبت‌شده خود از طریق کد پیگیری",
      "درخواست اصلاح اطلاعات نادرست",
      "درخواست حذف اطلاعات پس از پایان فرایند",
      "انتخاب کانال ارتباطی دلخواه و لغو پیام‌های اطلاع‌رسانی غیرضروری",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "حریم خصوصی", href: "/privacy" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="حریم خصوصی"
        icon="lock"
        title="سیاست حریم خصوصی"
        description="این متن به زبان ساده توضیح می‌دهد چه اطلاعاتی دریافت می‌شود، چرا دریافت می‌شود و چگونه از آن محافظت می‌کنیم. اصل ما این است: تنها اطلاعاتی که برای رسیدگی به درخواست لازم است."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "حریم خصوصی", href: "/privacy" },
        ]}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="بدون دریافت کد ملی" value="در فرم‌های عمومی" icon="shieldCheck" tone="success" />
          <Metric label="فضای ذخیره‌سازی" value="خصوصی، جدا از سایت" icon="database" />
          <Metric label="ثبت دسترسی" value="هر مشاهده مدرک" icon="eye" tone="gold" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[0.86rem] font-black text-ink-900 dark:text-white">
                <Icon name="layers" size={17} className="text-brand-600 dark:text-brand-400" />
                فهرست موضوعات
              </h2>
              <ol className="mt-3 space-y-1.5">
                {SECTIONS.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-[0.76rem] font-bold text-ink-600 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-300 dark:hover:bg-brand-500/10"
                    >
                      <span className="numeric mt-0.5 shrink-0 text-ink-400">{index + 1}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-[var(--border-soft)] pt-3 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
                آخرین به‌روزرسانی: {formatDate("2026-09-01T00:00:00.000Z", "medium")}
              </p>
            </Card>
          </aside>

          <div className="space-y-8">
            <Alert tone="brand" icon="info" title="خلاصه در یک جمله">
              تنها اطلاعاتی را می‌گیریم که برای رسیدگی به همان درخواست لازم است؛ آن‌ها را در اختیار کسی بیرون از فرایند
              رسیدگی قرار نمی‌دهیم و در صورت درخواست شما، حذف می‌کنیم.
            </Alert>

            {SECTIONS.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon name={section.icon} size={19} />
                  </span>
                  <h2 className="text-xl font-black text-ink-900 dark:text-white">
                    {toFaNumber(index + 1)}. {section.title}
                  </h2>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.86rem] leading-8 text-ink-700 dark:text-ink-200">
                      <Icon name="check" size={16} strokeWidth={2.6} className="mt-2 shrink-0 text-brand-600 dark:text-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                {section.note && (
                  <Alert tone="warning" className="mt-4">
                    {section.note}
                  </Alert>
                )}
              </section>
            ))}

            <SectionHeading
              align="start"
              eyebrow=""
              icon="phone"
              title="پرسش درباره حریم خصوصی؟"
              description="برای هر پرسشی درباره نگه‌داری اطلاعات، حذف یا اصلاح آن، با دفتر تماس بگیرید یا از فرم «سایر درخواست‌ها» موضوع را ارسال کنید."
            />
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${SITE.phones[0].value}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-[0.82rem] font-black text-white transition hover:bg-brand-700"
              >
                <Icon name="phone" size={17} />
                <span className="numeric">{SITE.phones[0].display}</span>
              </a>
              <Link
                href="/request?service=other"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-4 py-3 text-[0.82rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
              >
                <Icon name="send" size={17} />
                ارسال درخواست
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title="سامانه شفاف، شما مطمئن"
        description="با کد پیگیری همیشه می‌دانید درخواست شما در چه مرحله‌ای است و چه اطلاعاتی ثبت شده است."
        primary={{ href: "/track", label: "پیگیری درخواست", icon: "track" }}
        secondary={{ href: "/terms", label: "شرایط استفاده", icon: "file" }}
      />
    </>
  );
}

function toFaNumber(value: number): string {
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
