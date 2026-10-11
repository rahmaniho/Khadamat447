import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { RequestEntry } from "@/components/request/request-entry";
import { CheckList, Section } from "@/components/site/section";
import { Badge, Metric } from "@/components/ui/primitives";
import { SERVICES } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "ثبت درخواست آنلاین",
  description:
    "فرم چندمرحله‌ای ثبت درخواست دفتر خدمات سلامت ۴۷۷ قزوین: انتخاب خدمت، تکمیل اطلاعات، بارگذاری مدارک و دریافت کد پیگیری اختصاصی.",
  path: "/request",
  keywords: ["ثبت درخواست", "فرم آنلاین", "کد پیگیری", "خدمات سلامت ۴۷۷"],
});

export default function RequestPage() {
  return (
    <>
      <Suspense fallback={<div className="h-[22rem]" />}>
        <RequestEntry />
      </Suspense>

      <Section>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="گام‌های فرم" value={`${toFaDigits(5)} گام کوتاه`} icon="wizard" />
          <Metric label="زمان تقریبی" value="۳ تا ۵ دقیقه" icon="clock" tone="gold" />
          <Metric label="خدمات قابل انتخاب" value={`${toFaDigits(SERVICES.length)} خدمت`} icon="services" tone="info" />
          <Metric label="ذخیره پیش‌نویس" value="خودکار در مرورگر" icon="save" tone="success" />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="surface-card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="clipboard" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">پیش از شروع آماده کنید</h3>
            <div className="mt-3">
              <CheckList
                items={[
                  "شماره همراه فعال برای دریافت کد پیگیری",
                  "اطلاعات محل فعالیت یا واحد صنفی",
                  "تصویر مدارک هویتی (در صورت داشتن)",
                  "توضیح کوتاه درباره درخواست",
                ]}
              />
            </div>
          </div>

          <div className="surface-card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300">
              <Icon name="shieldCheck" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">چه چیزی نمی‌پرسیم</h3>
            <div className="mt-3">
              <CheckList
                tone="gold"
                items={[
                  "کد ملی و شماره حساب بانکی",
                  "اطلاعات پزشکی و پرونده سلامت",
                  "اطلاعات کاری سایر افراد غیرمرتبط",
                  "مدارکی که برای همین خدمت لازم نیست",
                ]}
              />
            </div>
          </div>

          <div className="surface-card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Icon name="track" size={21} />
            </span>
            <h3 className="mt-4 font-black text-ink-900 dark:text-white">بعد از ارسال چه اتفاقی می‌افتد؟</h3>
            <ol className="mt-3 space-y-2 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
              <li className="flex gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.66rem] font-black text-white">
                  ۱
                </span>
                کد پیگیری نمایش داده می‌شود و پیام تأیید برای شما آماده می‌گردد.
              </li>
              <li className="flex gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.66rem] font-black text-white">
                  ۲
                </span>
                کارشناس دفتر درخواست را بررسی و در صورت نیاز موارد ناقص را اعلام می‌کند.
              </li>
              <li className="flex gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.66rem] font-black text-white">
                  ۳
                </span>
                هر تغییر وضعیت در صفحه پیگیری و از طریق کانال انتخابی شما قابل مشاهده است.
              </li>
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
}
