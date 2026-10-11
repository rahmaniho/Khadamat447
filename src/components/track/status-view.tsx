"use client";

/**
 * نمایش وضعیت یک درخواست: نوار پیشرفت، خط زمان رویدادها و جزئیات
 * مشترک بین صفحه پیگیری، کارتابل من و صفحه موفقیت ثبت درخواست.
 */
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Card, Progress, Rating, Timeline, TimelineItem } from "@/components/ui/primitives";
import { STATUS_META, type RequestRecord } from "@/lib/store/types";
import { cn } from "@/lib/cn";
import { fa, faBytes, formatDate, maskPhone, timeAgo } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

const FLOW = ["new", "pending_review", "in_review", "ready_to_report", "completed"] as const;

export function StatusBadge({ status }: { status: RequestRecord["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function StatusTimeline({ request }: { request: RequestRecord }) {
  return (
    <Timeline>
      {[...request.timeline]
        .filter((event) => event.visibility === "public")
        .reverse()
        .map((event, i, all) => {
          const meta = STATUS_META[event.status];
          return (
            <TimelineItem
              key={event.id}
              color={meta.color}
              icon={event.status === "completed" ? "check" : event.status === "rejected" ? "close" : "dot"}
              last={i === all.length - 1}
              title={
                <>
                  <span>{meta.label}</span>
                  {event.channel && (
                    <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.62rem] font-bold text-ink-500 dark:text-ink-400">
                      اطلاع‌رسانی: {event.channel === "sms" ? "پیامک" : event.channel === "email" ? "ایمیل" : "تماس"}
                    </span>
                  )}
                </>
              }
              meta={
                <>
                  {formatDate(event.at, "datetime")} · {timeAgo(event.at)} · {event.actor}
                </>
              }
            >
              {event.note && <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">{event.note}</p>}
            </TimelineItem>
          );
        })}
    </Timeline>
  );
}

export function RequestStatusCard({
  request,
  onRate,
}: {
  request: RequestRecord;
  onRate?: (rating: number) => void;
}) {
  const statusIndex = FLOW.indexOf(request.status as (typeof FLOW)[number]);
  const progress = request.status === "rejected" ? 100 : ((statusIndex + 1) / FLOW.length) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
      <div className="space-y-6">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full bg-brand-100/50 blur-2xl dark:bg-brand-500/10" aria-hidden />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">کد پیگیری</p>
              <p className="numeric mt-1 text-xl font-black tracking-wider text-ink-900 dark:text-white" dir="ltr">
                {request.trackingCode}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="relative mt-5">
            <Progress value={progress} tone={request.status === "rejected" ? "danger" : "brand"} />
            <div className="mt-3 flex justify-between text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
              <span>ثبت</span>
              <span>بررسی</span>
              <span>نتیجه</span>
            </div>
          </div>

          <dl className="relative mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: "خدمت", value: request.serviceTitle, icon: "services" },
              { label: "متقاضی", value: request.fullName, icon: "user" },
              { label: "تماس", value: toFaDigits(maskPhone(request.phone)), icon: "phone" },
              { label: "زمان ثبت", value: formatDate(request.createdAt, "datetime"), icon: "calendar" },
              { label: "آخرین به‌روزرسانی", value: timeAgo(request.updatedAt), icon: "refresh" },
              { label: "مسئول بررسی", value: request.assignee || "در انتظار تخصیص", icon: "user" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-2.5 rounded-2xl border border-[var(--border-soft)] p-3">
                <Icon name={row.icon} size={17} className="mt-1 shrink-0 text-brand-600 dark:text-brand-400" />
                <div className="min-w-0">
                  <dt className="text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">{row.label}</dt>
                  <dd className="truncate text-[0.8rem] font-black text-ink-900 dark:text-white">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          {request.attachments.length > 0 && (
            <div className="relative mt-5">
              <p className="text-[0.72rem] font-black text-ink-700 dark:text-ink-200">مدارک پیوست</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {request.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 px-3 py-2 text-[0.72rem] font-bold text-ink-700 dark:text-ink-200"
                  >
                    <Icon name={file.ext === ".pdf" ? "file" : "image"} size={15} className="text-brand-600 dark:text-brand-400" />
                    <span className="max-w-40 truncate">{file.name}</span>
                    <span className="text-ink-400">{faBytes(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {request.status === "completed" && (
            <div className="relative mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Icon name="checkCircle" size={22} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-[0.84rem] font-black text-emerald-900 dark:text-emerald-100">
                      فرایند این درخواست پایان یافته است
                    </p>
                    <p className="text-[0.72rem] text-emerald-800/80 dark:text-emerald-200/70">
                      اگر تجربه خود را ثبت کنید، در بهبود خدمات مؤثر است.
                    </p>
                  </div>
                </div>
                <Rating value={request.rating ?? 0} size={20} />
              </div>
              {onRate && (
                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => onRate(score)}
                      aria-label={`${score} ستاره`}
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl border transition",
                        (request.rating ?? 0) >= score
                          ? "border-gold-300 bg-gold-50 text-gold-600 dark:border-gold-400/40 dark:bg-gold-500/12 dark:text-gold-300"
                          : "border-[var(--border-soft)] text-ink-400 hover:border-gold-300",
                      )}
                    >
                      <Icon name="star" size={17} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="layers" size={19} className="text-brand-600 dark:text-brand-400" />
            اطلاعات ثبت‌شده
          </h3>
          <ul className="mt-4 space-y-2">
            {request.answers.map((answer) => (
              <li key={answer.key} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-2.5">
                <span className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">{answer.label}</span>
                <span className="max-w-[60%] truncate text-[0.8rem] font-black text-ink-800 dark:text-ink-100">{answer.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="track" size={19} className="text-brand-600 dark:text-brand-400" />
            خط زمان درخواست
          </h3>
          <p className="mt-1.5 text-[0.76rem] text-ink-500 dark:text-ink-400">
            فقط رویدادهای عمومی نمایش داده می‌شود؛ یادداشت‌های داخلی کارشناسان در پیشخوان مدیریت است.
          </p>
          <div className="mt-5">
            <StatusTimeline request={request} />
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-black text-ink-900 dark:text-white">اقدام‌های بعدی</h3>
          <ul className="space-y-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
            <li className="flex gap-2">
              <Icon name="info" size={16} className="mt-1.5 shrink-0 text-brand-600" />
              این صفحه را ذخیره یا نشان‌گذاری کنید؛ با کد پیگیری همیشه قابل دسترسی است.
            </li>
            <li className="flex gap-2">
              <Icon name="info" size={16} className="mt-1.5 shrink-0 text-brand-600" />
              در صورت تغییر شماره تماس، با دفتر هماهنگ کنید تا اطلاع‌رسانی قطع نشود.
            </li>
            <li className="flex gap-2">
              <Icon name="info" size={16} className="mt-1.5 shrink-0 text-brand-600" />
              برای پیگیری تلفنی، کد پیگیری را آماده داشته باشید.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/my-requests"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2 text-[0.74rem] font-black text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/12 dark:text-brand-200"
            >
              <Icon name="user" size={15} />
              کارتابل من
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-[0.74rem] font-black text-ink-700 transition hover:border-brand-300 dark:text-ink-200"
            >
              <Icon name="search" size={15} />
              پیگیری کد دیگر
            </Link>
            <a
              href={`tel:${request.phone}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-[0.74rem] font-black text-ink-700 transition hover:border-brand-300 dark:text-ink-200"
            >
              <Icon name="phone" size={15} />
              تماس با دفتر
            </a>
          </div>
        </Card>

        <Card className="bg-[var(--surface-muted)]/60">
          <p className="text-[0.76rem] leading-7 text-ink-600 dark:text-ink-300">
            <strong className="font-black text-ink-800 dark:text-ink-100">یادآوری:</strong> ثبت درخواست آنلاین به معنی تأیید
            نهایی، صدور مجوز یا تکمیل فرایند اداری نیست. نتیجه پس از بررسی کارشناسی اعلام می‌شود.
          </p>
          <p className="mt-3 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            تعداد رویدادهای ثبت‌شده: {fa(request.timeline.length)}
          </p>
        </Card>
      </div>
    </div>
  );
}
