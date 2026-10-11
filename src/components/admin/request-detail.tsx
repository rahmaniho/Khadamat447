"use client";

/**
 * پرونده درخواست (پیشخوان)
 * ---------------------------------------------------------------
 * نمایش کامل اطلاعات متقاضی، پاسخ فیلدها، مدارک، تغییر وضعیت با
 * یادداشت عمومی/داخلی، اعلان‌های مرتبط، یادداشت‌های کارشناس و
 * سابقه رویدادهای همین پرونده.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { AdminPageHeader, PermissionNotice } from "@/components/admin/shell";
import { Alert, Avatar, Badge, Button, ButtonLink, Card, Divider, EmptyState, Metric, Progress, Rating, Timeline, TimelineItem } from "@/components/ui/primitives";
import { ConfirmDialog, Tooltip } from "@/components/ui/overlay";
import { Input, Select, Textarea } from "@/components/ui/form";
import { useStore } from "@/lib/store/store";
import {
  CHANNEL_META,
  PRIORITY_META,
  STATUS_META,
  type Channel,
  type EventVisibility,
  type RequestStatus,
} from "@/lib/store/types";
import { fa, faBytes, faNumber, formatDate, timeAgo } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";
import { cn } from "@/lib/cn";

const STATUS_ORDER: RequestStatus[] = [
  "new",
  "pending_review",
  "needs_info",
  "in_review",
  "ready_to_report",
  "completed",
  "rejected",
];

export function RequestDetail() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const router = useRouter();
  const {
    state,
    can,
    changeStatus,
    addNote,
    verifyAttachment,
    removeAttachment,
    deleteRequest,
    updateRequest,
    setRating,
    retryNotification,
    serviceBySlug,
    toast,
  } = useStore();

  const request = useMemo(() => state.requests.find((r) => r.trackingCode === code), [state.requests, code]);

  const [nextStatus, setNextStatus] = useState<RequestStatus | "">("");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [channel, setChannel] = useState<Channel | "">("");
  const [internalNote, setInternalNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"timeline" | "notes" | "notifications">("timeline");

  if (!can("requests.view")) return <PermissionNotice permission="requests.view" />;

  if (!request) {
    return (
      <div>
        <AdminPageHeader title="پرونده پیدا نشد" description="کد پیگیری وارد‌شده در سامانه ثبت نشده است." icon="alertCircle" />
        <EmptyState
          icon="search"
          title={`درخواستی با کد ${code || "—"} یافت نشد`}
          description="ممکن است کد اشتباه تایپ شده باشد یا این درخواست در نسخه نمایشی این مرورگر ثبت نشده باشد."
          action={
            <ButtonLink href="/admin/requests" icon="inbox" size="sm">
              بازگشت به کارتابل
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const service = serviceBySlug(request.serviceSlug);
  const notifications = state.notifications.filter((n) => n.requestId === request.id || n.trackingCode === request.trackingCode);
  const publicEvents = request.timeline;
  const meta = STATUS_META[request.status];
  const overdue = new Date(request.dueAt).getTime() < Date.now() && !["completed", "rejected"].includes(request.status);

  const changeAssignee = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    updateRequest(request.id, { assignee: user?.name ?? "", updatedAt: new Date().toISOString() });
    toast.success(user ? `پرونده به ${user.name} واگذار شد` : "کارشناس پرونده حذف شد");
  };

  return (
    <div>
      <AdminPageHeader
        title={`پرونده ${request.trackingCode}`}
        description={`${request.serviceTitle} — ثبت‌شده در ${formatDate(request.createdAt, "datetime")}`}
        icon="fileCheck"
        breadcrumbs={[
          { name: "درخواست‌ها", href: "/admin/requests" },
          { name: request.trackingCode, href: `/admin/requests/view?code=${request.trackingCode}` },
        ]}
        actions={
          <>
            <ButtonLink href={`/request/success?code=${request.trackingCode}`} size="sm" variant="outline" icon="external" external>
              نمای مراجع
            </ButtonLink>
            <Button
              size="sm"
              variant="outline"
              icon="copy"
              onClick={() => {
                navigator.clipboard?.writeText(request.trackingCode);
                toast.success("کد پیگیری کپی شد");
              }}
            >
              کپی کد
            </Button>
            <Button size="sm" variant="ghost" icon="print" onClick={() => window.print()}>
              چاپ
            </Button>
            {can("requests.delete") && (
              <Button size="sm" variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>
                حذف
              </Button>
            )}
          </>
        }
      />

      {/* وضعیت جاری */}
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={meta.tone} dot>
                  {meta.label}
                </Badge>
                <Badge tone="slate" size="sm">
                  {PRIORITY_META[request.priority].label}
                </Badge>
                {request.source !== "web" && (
                  <Badge tone="info" size="sm">
                    {request.source === "phone" ? "ثبت تلفنی" : "ارجاعی"}
                  </Badge>
                )}
                {overdue && (
                  <Badge tone="rose" size="sm" dot>
                    عقب‌افتاده از مهلت
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-[0.84rem] leading-8 text-ink-700 dark:text-ink-200">{meta.description}</p>
            </div>
            <div className="min-w-40">
              <p className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">پیشرفت رسیدگی</p>
              <div className="mt-2">
                <Progress value={meta.step} max={5} tone={request.status === "rejected" ? "danger" : "brand"} showLabel />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="ثبت درخواست" value={formatDate(request.createdAt, "medium")} icon="calendar" />
            <Metric
              label="مهلت رسیدگی"
              value={formatDate(request.dueAt, "medium")}
              icon="clock"
              tone={overdue ? "danger" : "gold"}
            />
            <Metric label="آخرین تغییر" value={timeAgo(request.updatedAt)} icon="refresh" tone="info" />
            <Metric label="تعداد مدارک" value={faNumber(request.attachments.length)} icon="folder" tone="success" />
          </div>

          {can("requests.manage") && (
            <div className="mt-5 grid gap-3 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[0.72rem] font-black text-ink-600 dark:text-ink-300">کارشناس پرونده</label>
                <select
                  value={state.users.find((u) => u.name === request.assignee)?.id ?? ""}
                  onChange={(e) => changeAssignee(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-[0.8rem] font-bold text-ink-700 dark:text-ink-200"
                >
                  <option value="">بدون کارشناس</option>
                  {state.users
                    .filter((u) => u.role === "reviewer" || u.role === "owner")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} — {user.role === "owner" ? "مدیر کل" : "کارشناس بررسی"}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.72rem] font-black text-ink-600 dark:text-ink-300">اولویت</label>
                <select
                  value={request.priority}
                  onChange={(e) => updateRequest(request.id, { priority: e.target.value as typeof request.priority })}
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-[0.8rem] font-bold text-ink-700 dark:text-ink-200"
                >
                  {Object.entries(PRIORITY_META).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {request.rating ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3 dark:bg-emerald-500/10">
              <Rating value={request.rating} showValue />
              <p className="text-[0.74rem] font-bold text-emerald-800 dark:text-emerald-200">
                رضایت مراجع ثبت شده است. برای اصلاح، مقدار جدید را انتخاب کنید:
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(request.id, value)}
                    className="rounded-lg px-1.5 text-[0.72rem] font-black text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200"
                  >
                    {toFaDigits(value)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* اطلاعات متقاضی */}
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={request.fullName} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate font-black text-ink-900 dark:text-white">{request.fullName}</h2>
              <p className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
                {request.requesterType === "company" ? "واحد صنفی / شرکت" : "شخص حقیقی"}
                {request.organization ? ` — ${request.organization}` : ""}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[0.78rem]">
            {[
              { label: "شماره همراه", value: request.phone, ltr: true, href: `tel:${request.phone}` },
              { label: "ایمیل", value: request.email || "—", ltr: true, href: request.email ? `mailto:${request.email}` : undefined },
              { label: "شهر", value: request.city || "—" },
              { label: "کانال ارتباطی", value: CHANNEL_META[request.contactPreference].label },
              { label: "اجازه اطلاع‌رسانی", value: request.consent ? "دارد" : "ندارد" },
              { label: "خبرنامه", value: request.newsletter ? "عضویت دارد" : "عضویت ندارد" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                <dt className="font-bold text-ink-500 dark:text-ink-400">{row.label}</dt>
                <dd className={cn("font-black text-ink-900 dark:text-white", row.ltr && "numeric")} dir={row.ltr ? "ltr" : undefined}>
                  {row.href ? (
                    <a href={row.href} className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <Divider label="توضیح متقاضی" />
          <p className="text-[0.8rem] leading-8 text-ink-700 dark:text-ink-200">{request.summary || "—"}</p>

          {service && (
            <Link
              href={`/services/${service.slug}`}
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] px-4 py-3 transition hover:border-brand-300"
            >
              <span>
                <span className="block text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">صفحه خدمت در سایت</span>
                <span className="block text-[0.8rem] font-black text-ink-900 dark:text-white">{service.title}</span>
              </span>
              <Icon name="chevronLeft" size={17} className="text-ink-400" />
            </Link>
          )}
        </Card>
      </div>

      {/* تغییر وضعیت */}
      {can("requests.manage") && (
        <Card className="mt-5 p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="wizard" size={19} className="text-brand-600 dark:text-brand-400" />
            ثبت تغییر وضعیت و اطلاع‌رسانی
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3">
              <Select
                label="وضعیت جدید"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as RequestStatus | "")}
                options={[
                  { value: "", label: "انتخاب وضعیت…" },
                  ...STATUS_ORDER.map((key) => ({ value: key, label: `${STATUS_META[key].label} — ${STATUS_META[key].description}` })),
                ]}
              />
              <Select
                label="کانال اطلاع‌رسانی"
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel | "")}
                help="برای عدم ارسال اعلان، «بدون ارسال» را انتخاب کنید."
                options={[
                  { value: "", label: "بدون ارسال" },
                  ...Object.entries(CHANNEL_META).map(([key, value]) => ({ value: key, label: value.label })),
                ]}
              />
              <div>
                <label className="mb-1.5 block text-[0.72rem] font-black text-ink-600 dark:text-ink-300">نمایش یادداشت</label>
                <div className="flex gap-2">
                  {(
                    [
                      { id: "public" as EventVisibility, label: "برای مراجع قابل مشاهده", icon: "eye" },
                      { id: "internal" as EventVisibility, label: "فقط کارشناسان", icon: "lock" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVisibility(option.id)}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-2xl border px-3 py-2.5 text-[0.72rem] font-bold transition",
                        visibility === option.id
                          ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-100"
                          : "border-[var(--border-soft)] text-ink-600 hover:border-brand-300 dark:text-ink-300",
                      )}
                    >
                      <Icon name={option.icon} size={15} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                label="یادداشت همراه تغییر وضعیت"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثلاً: مدارک بررسی شد؛ برای صدور کارت، مراجعه حضوری لازم است."
                help="این متن در صفحه پیگیری مراجع (در صورت انتخاب گزینه عمومی) و در اعلان‌ها استفاده می‌شود."
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  icon="save"
                  disabled={!nextStatus}
                  onClick={() => {
                    if (!nextStatus) return;
                    changeStatus(request.id, nextStatus, note || `تغییر وضعیت به ${STATUS_META[nextStatus].label}`, {
                      visibility,
                      channel: channel || undefined,
                    });
                    toast.success("وضعیت ثبت شد", `اکنون: ${STATUS_META[nextStatus].label}`);
                    setNote("");
                    setNextStatus("");
                    setChannel("");
                    setVisibility("public");
                  }}
                >
                  ثبت تغییر وضعیت
                </Button>
                <Button
                  variant="outline"
                  icon="bell"
                  disabled={!nextStatus}
                  onClick={() => {
                    if (!nextStatus) return;
                    changeStatus(request.id, nextStatus, note || "اطلاع‌رسانی وضعیت", { visibility, channel: "sms" });
                    changeStatus(request.id, nextStatus, note || "اطلاع‌رسانی وضعیت", { visibility, channel: "email" });
                    toast.info("اطلاع‌رسانی چندکاناله ثبت شد");
                  }}
                >
                  ثبت + پیامک و ایمیل
                </Button>
                <span className="text-[0.68rem] font-bold text-ink-400 dark:text-ink-500">
                  وضعیت‌های بعدی پیشنهادی: {SUGGESTIONS(request.status).map((s) => STATUS_META[s].label).join(" • ")}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* پاسخ فیلدها و مدارک */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="list" size={19} className="text-brand-600 dark:text-brand-400" />
            پاسخ‌های فرم درخواست
          </h2>
          <dl className="mt-4 space-y-2.5">
            {request.answers.length === 0 && (
              <p className="text-[0.8rem] font-bold text-ink-500 dark:text-ink-400">پاسخ اختصاصی ثبت نشده است.</p>
            )}
            {request.answers.map((answer) => (
              <div key={answer.key} className="rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-3">
                <dt className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">{answer.label}</dt>
                <dd className="mt-1 text-[0.8rem] font-bold leading-7 text-ink-800 dark:text-ink-100">{answer.value || "—"}</dd>
              </div>
            ))}
          </dl>
          {service && service.fields.length > 0 && (
            <p className="mt-4 text-[0.68rem] font-bold text-ink-400 dark:text-ink-500">
              این خدمت {toFaDigits(service.fields.length)} فیلد اختصاصی دارد؛ فیلدهای خالی در فرم پر نشده‌اند.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
              <Icon name="folder" size={19} className="text-brand-600 dark:text-brand-400" />
              مدارک بارگذاری‌شده
            </h2>
            <Badge tone="slate" size="sm">
              {faNumber(request.attachments.length)} فایل
            </Badge>
          </div>

          {request.attachments.length === 0 ? (
            <p className="mt-4 text-[0.8rem] font-bold text-ink-500 dark:text-ink-400">مدرکی برای این پرونده بارگذاری نشده است.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {request.attachments.map((file) => (
                <li key={file.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] p-3">
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      file.verified ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                    )}
                  >
                    <Icon name={file.verified ? "fileCheck" : "file"} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.78rem] font-black text-ink-900 dark:text-white">{file.name}</p>
                    <p className="text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
                      {faBytes(file.size)} • {file.ext.toUpperCase()} • بارگذاری {timeAgo(file.uploadedAt)}
                    </p>
                  </div>
                  {can("requests.manage") && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Tooltip content={file.verified ? "لغو تأیید مدرک" : "تأیید مدرک"}>
                        <button
                          type="button"
                          onClick={() => verifyAttachment(request.id, file.id, !file.verified)}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-500 transition hover:text-emerald-600"
                          aria-label="تأیید مدرک"
                        >
                          <Icon name="checkCircle" size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content="حذف مدرک">
                        <button
                          type="button"
                          onClick={() => {
                            removeAttachment(request.id, file.id);
                            toast.warning("مدرک حذف شد");
                          }}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-500 transition hover:text-rose-600"
                          aria-label="حذف مدرک"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Alert tone="info" className="mt-4" icon="lock">
            فایل‌ها در نسخه نمایشی فقط به‌صورت فراداده ذخیره می‌شوند؛ محتوای واقعی فایل در مرورگر نگه‌داری نمی‌شود.
          </Alert>
        </Card>
      </div>

      {/* سابقه، یادداشت‌ها و اعلان‌ها */}
      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-soft)] pb-4">
          {(
            [
              { id: "timeline" as const, label: "سابقه وضعیت‌ها", icon: "activity", count: publicEvents.length },
              { id: "notes" as const, label: "یادداشت‌های داخلی", icon: "lock", count: request.notes.length },
              { id: "notifications" as const, label: "اعلان‌های پرونده", icon: "send", count: notifications.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[0.78rem] font-black transition",
                tab === item.id
                  ? "bg-brand-600 text-white shadow-[0_10px_24px_-14px_rgba(30,122,113,.9)]"
                  : "text-ink-600 hover:bg-brand-50 dark:text-ink-300 dark:hover:bg-brand-500/10",
              )}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
              <span className={cn("numeric rounded-full px-1.5 text-[0.62rem]", tab === item.id ? "bg-white/25" : "bg-ink-100 dark:bg-white/10")}>
                {faNumber(item.count)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "timeline" && (
            <Timeline>
              {[...publicEvents].reverse().map((event) => (
                <TimelineItem
                  key={event.id}
                  title={STATUS_META[event.status].label}
                  meta={`${formatDate(event.at, "datetime")} • ${event.actor}`}
                  color={STATUS_META[event.status].color}
                  icon={event.visibility === "public" ? "eye" : "lock"}
                >
                  <p className="text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">{event.note}</p>
                  {event.channel && (
                    <Badge tone="info" size="sm" className="mt-2">
                      اطلاع‌رسانی از {CHANNEL_META[event.channel].label}
                    </Badge>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          )}

          {tab === "notes" && (
            <div className="space-y-4">
              {can("requests.manage") && (
                <div className="rounded-3xl border border-[var(--border-soft)] p-4">
                  <Textarea
                    label="یادداشت داخلی جدید"
                    rows={3}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="این یادداشت فقط برای کارشناسان نمایش داده می‌شود."
                  />
                  <Button
                    size="sm"
                    icon="plus"
                    className="mt-3"
                    disabled={internalNote.trim().length < 3}
                    onClick={() => {
                      addNote(request.id, internalNote.trim());
                      setInternalNote("");
                      toast.success("یادداشت ثبت شد");
                    }}
                  >
                    افزودن یادداشت
                  </Button>
                </div>
              )}
              {request.notes.length === 0 ? (
                <p className="text-[0.8rem] font-bold text-ink-500 dark:text-ink-400">یادداشت داخلی ثبت نشده است.</p>
              ) : (
                <ul className="space-y-3">
                  {[...request.notes].reverse().map((item) => (
                    <li key={item.id} className="rounded-2xl bg-[var(--surface-muted)]/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.72rem] font-black text-ink-700 dark:text-ink-200">{item.author}</p>
                        <p className="text-[0.64rem] font-bold text-ink-400">{timeAgo(item.at)}</p>
                      </div>
                      <p className="mt-2 text-[0.8rem] leading-7 text-ink-700 dark:text-ink-200">{item.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-3">
              {notifications.length === 0 && <p className="text-[0.8rem] font-bold text-ink-500 dark:text-ink-400">اعلانی برای این پرونده ثبت نشده است.</p>}
              {notifications.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border-soft)] p-3.5">
                  <Badge tone={item.status === "sent" ? "emerald" : item.status === "failed" ? "rose" : item.status === "opened" ? "info" : "amber"} size="sm" dot>
                    {item.status === "sent" ? "ارسال شده" : item.status === "failed" ? "ناموفق" : item.status === "opened" ? "باز شده" : "در صف"}
                  </Badge>
                  <Badge tone="slate" size="sm">
                    {CHANNEL_META[item.channel].label}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.76rem] font-black text-ink-900 dark:text-white">{item.subject}</p>
                    <p className="text-[0.64rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                      {item.recipient} • {formatDate(item.createdAt, "datetime")}
                    </p>
                  </div>
                  {(item.status === "failed" || item.status === "queued") && can("notifications.manage") && (
                    <Button size="sm" variant="outline" icon="refresh" onClick={() => { retryNotification(item.id); toast.info("ارسال مجدد در صف قرار گرفت"); }}>
                      تلاش مجدد
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteRequest(request.id);
          toast.warning("پرونده حذف شد");
          router.replace("/admin/requests");
        }}
        title="حذف این پرونده؟"
        description="با حذف پرونده، همه اطلاعات متقاضی، مدارک، سابقه وضعیت‌ها و اعلان‌های مرتبط حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
      />
    </div>
  );
}

function SUGGESTIONS(status: RequestStatus): RequestStatus[] {
  switch (status) {
    case "new":
      return ["pending_review", "needs_info"];
    case "pending_review":
      return ["in_review", "needs_info", "rejected"];
    case "needs_info":
      return ["in_review"];
    case "in_review":
      return ["ready_to_report", "needs_info"];
    case "ready_to_report":
      return ["completed"];
    default:
      return ["in_review"];
  }
}
