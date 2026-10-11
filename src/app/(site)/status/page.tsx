import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { CtaBand, PageHero, Section } from "@/components/site/section";
import { Badge, ButtonLink, Card, Metric, Progress, SectionHeading } from "@/components/ui/primitives";
import { SYSTEM_STATUS } from "@/lib/content/site";
import { pageMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "وضعیت سامانه",
  description:
    "شاخص دسترس‌پذیری بخش‌های مختلف سامانه دفتر خدمات سلامت ۴۷۷: فرم ثبت درخواست، پیگیری، پیشخوان مدیریت و کانال‌های اطلاع‌رسانی.",
  path: "/status",
  keywords: ["وضعیت سامانه", "دسترس پذیری", "آپ‌تایم"],
});

const INCIDENTS = [
  {
    at: "2026-09-28T09:15:00.000Z",
    title: "کندی موقت در ارسال پیامک",
    body: "به دلیل اختلال سرویس‌دهنده پیامک، ارسال پیام‌های اطلاع‌رسانی با تأخیر انجام شد. پیام‌های ارسال‌نشده در صف ارسال مجدد قرار گرفتند و هیچ درخواستی از دست نرفت.",
    level: "warning" as const,
    status: "برطرف شد",
  },
  {
    at: "2026-09-12T18:40:00.000Z",
    title: "به‌روزرسانی برنامه‌ریزی‌شده فرم‌ها",
    body: "بهینه‌سازی فرم چندمرحله‌ای و اعتبارسنجی فیلدها انجام شد. در این بازه، فرم‌ها در حالت فقط‌خواندنی قرار داشتند.",
    level: "info" as const,
    status: "انجام شد",
  },
  {
    at: "2026-08-30T11:05:00.000Z",
    title: "قطعی کوتاه پیشخوان مدیریت",
    body: "قطعی حدود ۹ دقیقه‌ای در پیشخوان مدیریت رخ داد. ثبت درخواست و پیگیری عمومی بدون اختلال ادامه داشت.",
    level: "danger" as const,
    status: "برطرف شد",
  },
];

const STATUS_TONE = {
  operational: { label: "فعال", tone: "emerald", progress: 100 },
  degraded: { label: "کندی جزئی", tone: "amber", progress: 78 },
  outage: { label: "قطعی", tone: "rose", progress: 12 },
} as const;

export default function StatusPage() {
  const operationalCount = SYSTEM_STATUS.filter((item) => item.status === "operational").length;
  const overall = operationalCount === SYSTEM_STATUS.length ? "operational" : "degraded";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "وضعیت سامانه", href: "/status" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="وضعیت سامانه"
        icon="activity"
        title="دسترس‌پذیری بخش‌های سامانه"
        description="این صفحه وضعیت بخش‌های مختلف سامانه را نشان می‌دهد تا بدانید در هر لحظه کدام سرویس در دسترس است و آیا اختلالی وجود دارد."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "وضعیت سامانه", href: "/status" },
        ]}
        actions={
          <Badge
            tone="brand"
            icon={overall === "operational" ? "checkCircle" : "alert"}
            className="bg-white/12 text-white ring-white/25"
          >
            {overall === "operational" ? "همه سرویس‌ها فعال" : "برخی سرویس‌ها با تأخیر"}
          </Badge>
        }
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="سرویس‌های پایش‌شده" value={`${SYSTEM_STATUS.length} سرویس`} icon="layers" />
          <Metric label="سرویس‌های فعال" value={`${operationalCount} سرویس`} icon="checkCircle" tone="success" />
          <Metric label="آخرین بررسی" value={formatDate(new Date(), "datetime")} icon="clock" tone="gold" />
        </div>

        <div className="mt-10 space-y-4">
          {SYSTEM_STATUS.map((service) => {
            const meta = STATUS_TONE[service.status];
            return (
              <Card key={service.name} className="flex flex-wrap items-center gap-4 p-5">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    service.status === "operational"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  <Icon name={service.status === "operational" ? "checkCircle" : "alert"} size={21} />
                </span>
                <div className="min-w-40 flex-1">
                  <p className="font-black text-ink-900 dark:text-white">{service.name}</p>
                  <p className="mt-0.5 text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">
                    دسترس‌پذیری ۳۰ روز گذشته: <span className="numeric">{service.uptime}</span>
                  </p>
                </div>
                <div className="w-full max-w-56">
                  <Progress value={meta.progress} tone={service.status === "operational" ? "success" : "gold"} size="sm" />
                </div>
                <Badge tone={meta.tone} dot>
                  {meta.label}
                </Badge>
              </Card>
            );
          })}
        </div>

        <div className="mt-12">
          <SectionHeading
            align="start"
            eyebrow="سابقه رویدادها"
            icon="archive"
            title="اختلال‌ها و به‌روزرسانی‌های اخیر"
            description="هر رویداد با زمان، توضیح و وضعیت فعلی ثبت می‌شود تا سابقه شفاف باشد."
          />
          <div className="mt-8 space-y-4">
            {INCIDENTS.map((incident) => {
              const tones = {
                info: "border-blue-200 bg-blue-50/60 dark:border-blue-500/25 dark:bg-blue-500/10",
                warning: "border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10",
                danger: "border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/10",
              };
              const icons = { info: "info", warning: "alert", danger: "alertCircle" };
              return (
                <div key={incident.title} className={`rounded-3xl border p-5 ${tones[incident.level]}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon
                        name={icons[incident.level]}
                        size={20}
                        className={
                          incident.level === "info"
                            ? "text-blue-600 dark:text-blue-300"
                            : incident.level === "warning"
                              ? "text-amber-600 dark:text-amber-300"
                              : "text-rose-600 dark:text-rose-300"
                        }
                      />
                      <p className="font-black text-ink-900 dark:text-white">{incident.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="slate" size="sm">
                        {formatDate(incident.at, "medium")}
                      </Badge>
                      <Badge tone="emerald" size="sm">
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-[0.82rem] leading-7 text-ink-700 dark:text-ink-200">{incident.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="shieldCheck" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">پشتیبان‌گیری منظم</h3>
            <p className="mt-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
              از داده‌های درخواست‌ها و محتوای سایت به‌صورت دوره‌ای نسخه پشتیبان تهیه می‌شود تا بازیابی سریع ممکن باشد.
            </p>
          </Card>
          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="lock" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">دسترسی محدود مدارک</h3>
            <p className="mt-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
              فایل‌های بارگذاری‌شده فقط برای کارکنان مجاز قابل مشاهده است و هر دسترسی در سابقه رویدادها ثبت می‌شود.
            </p>
          </Card>
          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="wifi" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">گزارش اختلال به دفتر</h3>
            <p className="mt-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
              اگر در استفاده از فرم‌ها مشکل داشتید، از فرم «سایر درخواست‌ها» اطلاع دهید تا بررسی شود.
            </p>
            <ButtonLink href="/request?service=other" size="sm" variant="outline" icon="chat" className="mt-4">
              گزارش مشکل
            </ButtonLink>
          </Card>
        </div>
      </Section>

      <CtaBand
        title="سامانه در دسترس است — درخواست خود را ثبت کنید"
        description="تمام بخش‌های عمومی سایت و فرم ثبت درخواست همیشه فعال هستند."
        secondary={{ href: "/contact", label: "تماس با دفتر", icon: "phone" }}
      />
    </>
  );
}
