"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink, Card } from "@/components/ui";
import { Alert, Metric, Timeline, TimelineItem } from "@/components/ui/primitives";
import { QrCode } from "@/components/qr-code";
import { useStore } from "@/lib/store/store";
import { STATUS_META } from "@/lib/store/types";
import { formatDate } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";
import { SITE } from "@/lib/content/site";
import { absolute } from "@/lib/seo";

export function RequestSuccess({ code }: { code: string }) {
  const { requestByCode, ready, rememberRequest, toast } = useStore();
  const [copied, setCopied] = useState(false);
  const request = code ? requestByCode(code) : undefined;

  useEffect(() => {
    if (code) rememberRequest(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("کد پیگیری کپی شد");
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      toast.error("کپی خودکار ممکن نشد", "کد را به‌صورت دستی یادداشت کنید.");
    }
  };

  const trackUrl = `${absolute("/track")}?code=${encodeURIComponent(code || "")}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-gradient-to-br from-emerald-500 to-brand-700 text-white shadow-2xl shadow-emerald-600/30">
          <span className="absolute inset-0 animate-pulse-ring rounded-4xl bg-emerald-500/40" aria-hidden />
          <Icon name="check" size={38} strokeWidth={2.6} />
        </span>
        <h1 className="mt-6 text-2xl font-black text-ink-900 md:text-3xl dark:text-white">درخواست شما ثبت شد</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[0.92rem] leading-8 text-ink-600 dark:text-ink-300">
          کد پیگیری زیر را نگه دارید. با این کد می‌توانید در هر زمان وضعیت درخواست خود را ببینید. در صورت فعال بودن کانال
          اطلاع‌رسانی، پیام تأیید برای شما ارسال می‌شود.
        </p>
      </div>

      <Card className="mt-10 overflow-hidden">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-bl from-brand-800 to-brand-950 p-7 text-white md:flex-row md:justify-between">
          <div className="text-center md:text-start">
            <p className="text-[0.72rem] font-bold text-white/70">کد پیگیری درخواست</p>
            <p className="numeric mt-2 text-2xl font-black tracking-[0.2em]" dir="ltr">
              {request?.trackingCode ?? code ?? "—"}
            </p>
            {request && (
              <p className="mt-2 text-[0.74rem] font-bold text-white/70">
                {request.serviceTitle} · {formatDate(request.createdAt, "datetime")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="light" icon={copied ? "check" : "copy"} onClick={copy}>
              {copied ? "کپی شد" : "کپی کد"}
            </Button>
            <ButtonLink
              href={`/track?code=${encodeURIComponent(code)}`}
              variant="outline"
              icon="track"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              مشاهده وضعیت
            </ButtonLink>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="وضعیت فعلی" value={request ? STATUS_META[request.status].label : "ثبت‌شده"} icon="activity" />
              <Metric
                label="زمان ثبت"
                value={request ? formatDate(request.createdAt, "medium") : formatDate(new Date(), "medium")}
                icon="calendar"
                tone="gold"
              />
              <Metric label="مدارک پیوست" value={`${toFaDigits(request?.attachments.length ?? 0)} فایل`} icon="upload" tone="info" />
              <Metric label="پیگیری" value="۲۴ ساعته آنلاین" icon="track" tone="success" />
            </div>

            <Alert tone="warning" icon="alert" title="این کد را گم نکنید">
              کد پیگیری تنها راه دسترسی شما به وضعیت درخواست است. همچنین در «کارتابل من» همین مرورگر ذخیره شد.
            </Alert>

            <div className="surface-card p-5">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="layers" size={19} className="text-brand-600 dark:text-brand-400" />
                مراحل پیش‌رو
              </h2>
              <Timeline className="mt-5">
                <TimelineItem color="#0ea5e9" icon="check" title="ثبت درخواست" meta="انجام شد — همین حالا">
                  درخواست شما در سامانه ثبت و برای کارشناس دفتر ارسال شد.
                </TimelineItem>
                <TimelineItem color="#f59e0b" icon="dot" title="بررسی اولیه" meta="۱ تا ۳ روز کاری">
                  اطلاعات و مدارک بررسی می‌شود؛ در صورت ناقص بودن، موارد لازم به شما اعلام می‌گردد.
                </TimelineItem>
                <TimelineItem color="#6366f1" icon="dot" title="بررسی کارشناسی" meta="در ساعات کاری">
                  در صورت نیاز، هماهنگی مراجعه حضوری یا ارائه توضیحات تکمیلی انجام می‌شود.
                </TimelineItem>
                <TimelineItem color="#10b981" icon="checkCircle" title="اعلام نتیجه" meta="پایان فرایند" last>
                  نتیجه در صفحه پیگیری و از طریق کانال ارتباطی انتخابی شما اعلام می‌شود.
                </TimelineItem>
              </Timeline>
            </div>
          </div>

          <div className="space-y-4 md:w-56">
            {code && <QrCode value={trackUrl} label="اسکن کنید تا صفحه پیگیری در گوشی باز شود" size={176} />}
            <div className="surface-card space-y-2 p-4 text-[0.74rem] font-bold text-ink-600 dark:text-ink-300">
              <p className="flex items-center gap-2">
                <Icon name="phone" size={15} className="text-brand-600 dark:text-brand-400" />
                <a href={`tel:${SITE.phones[0].value}`} className="numeric">
                  {toFaDigits(SITE.phones[0].display)}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="mail" size={15} className="text-brand-600 dark:text-brand-400" />
                <a href={`mailto:${SITE.email}`}>{SITE.emailDisplay}</a>
              </p>
              <p className="flex items-start gap-2 leading-6">
                <Icon name="clock" size={15} className="mt-1 shrink-0 text-brand-600 dark:text-brand-400" />
                {SITE.hoursSummary}
              </p>
            </div>
            <Button variant="outline" icon="print" full onClick={() => window.print()}>
              چاپ رسید درخواست
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/my-requests" icon="user">
          مشاهده در کارتابل من
        </ButtonLink>
        <ButtonLink href="/services" variant="outline" icon="services">
          خدمات دیگر
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" icon="home">
          بازگشت به صفحه اصلی
        </ButtonLink>
      </div>

      <p className="mt-8 text-center text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
        برای ثبت درخواست جدید کافی است{" "}
        <Link href="/request" className="text-brand-700 underline dark:text-brand-300">
          این فرم
        </Link>{" "}
        را دوباره باز کنید. {ready ? "" : ""}
      </p>
    </div>
  );
}
