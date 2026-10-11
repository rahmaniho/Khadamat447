"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { AdminPageHeader, PermissionNotice, TableShell } from "@/components/admin/shell";
import { AreaChart, BarsChart, DonutChart, Sparkline } from "@/components/admin/charts";
import { Avatar, Badge, ButtonLink, Card, Chip, EmptyState, Metric, Progress, Rating, SectionHeading } from "@/components/ui/primitives";
import { Tooltip } from "@/components/ui/overlay";
import { useStore } from "@/lib/store/store";
import { PRIORITY_META, STATUS_META, type RequestStatus } from "@/lib/store/types";
import { fa, faHours, faNumber, faPercent, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

const RANGE_OPTIONS = [
  { id: "7", label: "۷ روز" },
  { id: "14", label: "۱۴ روز" },
  { id: "30", label: "۳۰ روز" },
];

export default function AdminDashboardPage() {
  const { stats, state, can, currentUser, activeAnnouncements } = useStore();
  const [range, setRange] = useState("7");

  const trend = useMemo(() => {
    const days = Number(range);
    const source = stats.last7Days.slice(-days);
    return source.map((day) => ({ label: day.label, value: day.count }));
  }, [stats.last7Days, range]);

  const statusDonut = useMemo(
    () =>
      (Object.keys(STATUS_META) as RequestStatus[])
        .map((status) => ({
          label: STATUS_META[status].label,
          value: stats.byStatus[status] ?? 0,
          color: STATUS_META[status].color,
        }))
        .filter((item) => item.value > 0),
    [stats.byStatus],
  );

  const serviceBars = useMemo(
    () =>
      [...stats.byService]
        .sort((a, b) => b.count - a.count)
        .map((item) => ({ label: item.title, value: item.count, color: item.color })),
    [stats.byService],
  );

  const recent = useMemo(
    () => [...state.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [state.requests],
  );

  const recentAudit = useMemo(() => [...state.audit].slice(0, 7), [state.audit]);

  const queue = useMemo(
    () => state.notifications.filter((n) => n.status === "queued" || n.status === "failed").slice(0, 4),
    [state.notifications],
  );

  const activeCount = stats.total - stats.byStatus.completed - stats.byStatus.rejected;
  const openSatisfaction = stats.satisfaction;

  if (!can("dashboard.view")) {
    return <PermissionNotice permission="dashboard.view" />;
  }

  return (
    <div>
      <AdminPageHeader
        title={`سلام ${currentUser?.name.split(" ")[0] ?? ""} 👋`}
        description="نمای کلی درخواست‌ها، وضعیت رسیدگی، عملکرد کارشناسان و صف اعلان‌ها در یک نگاه."
        icon="chart"
        actions={
          <>
            <ButtonLink href="/admin/requests?status=new" size="sm" variant="outline" icon="inbox">
              صف بررسی
            </ButtonLink>
            <ButtonLink href="/admin/notifications" size="sm" icon="send">
              صف اعلان‌ها
            </ButtonLink>
          </>
        }
      />

      {activeAnnouncements.length > 0 && (
        <div className="mb-5 space-y-2">
          {activeAnnouncements.slice(0, 2).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-3xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-[0.8rem] font-bold text-brand-900 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-100">
              <Icon name="bell" size={17} />
              <span className="font-black">{item.title}</span>
              <span className="min-w-0 flex-1 truncate text-[0.74rem] font-bold opacity-80">{item.body}</span>
              <Badge tone="brand" size="sm">
                اطلاعیه فعال
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* کارت‌های آماری */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-black text-ink-500 dark:text-ink-400">کل درخواست‌ها</p>
              <p className="numeric mt-2 text-3xl font-black text-ink-900 dark:text-white">{faNumber(stats.total)}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="inbox" size={21} />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            <span>{faNumber(activeCount)} مورد در جریان</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              <Icon name="trendUp" size={13} className="inline" /> {faPercent(stats.completionRate)} تکمیل
            </span>
          </div>
          <Sparkline values={stats.last7Days.map((d) => d.count)} className="mt-3" />
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-black text-ink-500 dark:text-ink-400">در انتظار بررسی</p>
              <p className="numeric mt-2 text-3xl font-black text-ink-900 dark:text-white">
                {faNumber(stats.byStatus.new + stats.byStatus.pending_review)}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Icon name="clock" size={21} />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            <span>میانگین پاسخ اولیه: {faHours(stats.avgFirstResponseHours)}</span>
          </div>
          <div className="mt-3">
            <Progress
              value={stats.total ? ((stats.byStatus.new + stats.byStatus.pending_review) / stats.total) * 100 : 0}
              tone="gold"
              size="sm"
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-black text-ink-500 dark:text-ink-400">نیازمند تکمیل مدارک</p>
              <p className="numeric mt-2 text-3xl font-black text-ink-900 dark:text-white">{faNumber(stats.byStatus.needs_info)}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              <Icon name="alert" size={21} />
            </span>
          </div>
          <p className="mt-3 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            سهم از کل درخواست‌ها: {faPercent(stats.needsInfoRate)}
          </p>
          <ButtonLink href="/admin/requests?status=needs_info" size="sm" variant="ghost" icon="chevronLeft" className="mt-2 -ms-2">
            پیگیری موارد
          </ButtonLink>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-black text-ink-500 dark:text-ink-400">رضایت مراجعان</p>
              <p className="numeric mt-2 text-3xl font-black text-ink-900 dark:text-white">
                {openSatisfaction === null ? "—" : faNumber(openSatisfaction, 1)}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Icon name="star" size={21} />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Rating value={openSatisfaction ?? 0} showValue size={15} />
          </div>
          <p className="mt-2 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
            {faNumber(stats.attachments)} مدرک بارگذاری‌شده • {faNumber(stats.activeUsers)} کاربر فعال
          </p>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-ink-900 dark:text-white">روند ثبت درخواست‌ها</h2>
              <p className="mt-1 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
                تعداد درخواست‌های ثبت‌شده در هر روز
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {RANGE_OPTIONS.map((option) => (
                <Chip key={option.id} active={range === option.id} onClick={() => setRange(option.id)}>
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <AreaChart data={trend} height={210} />
          </div>
          <div className="mt-4 grid gap-3 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-3">
            <div>
              <p className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">میانگین تکمیل پرونده</p>
              <p className="mt-1 text-[0.86rem] font-black text-ink-900 dark:text-white">{faHours(stats.avgCompletionHours)}</p>
            </div>
            <div>
              <p className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">تکمیل‌شده</p>
              <p className="numeric mt-1 text-[0.86rem] font-black text-ink-900 dark:text-white">
                {faNumber(stats.byStatus.completed)} مورد
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">اعلان در انتظار ارسال</p>
              <p className="numeric mt-1 text-[0.86rem] font-black text-ink-900 dark:text-white">
                {faNumber(stats.queuedNotifications)} مورد
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-black text-ink-900 dark:text-white">توزیع وضعیت‌ها</h2>
          <p className="mt-1 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">سهم هر وضعیت از کل درخواست‌ها</p>
          <div className="mt-5">
            {statusDonut.length ? (
              <DonutChart data={statusDonut} centerLabel="کل درخواست‌ها" centerValue={faNumber(stats.total)} />
            ) : (
              <EmptyState icon="chartPie" title="داده‌ای برای نمایش نیست" />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-ink-900 dark:text-white">درخواست‌ها بر پایه خدمت</h2>
            <Badge tone="slate" size="sm">
              {faNumber(stats.byService.length)} خدمت فعال
            </Badge>
          </div>
          <div className="mt-5">
            {serviceBars.length ? (
              <BarsChart data={serviceBars} horizontal />
            ) : (
              <EmptyState icon="services" title="هنوز درخواستی ثبت نشده است" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-ink-900 dark:text-white">صف اعلان‌ها</h2>
            <Link href="/admin/notifications" className="text-[0.72rem] font-black text-brand-700 hover:underline dark:text-brand-300">
              همه اعلان‌ها
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {queue.length === 0 && <li className="text-[0.78rem] font-bold text-ink-500 dark:text-ink-400">صف خالی است.</li>}
            {queue.map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)]/70 p-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    item.status === "failed"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                  )}
                >
                  <Icon name={item.status === "failed" ? "alertCircle" : "clock"} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.76rem] font-black text-ink-900 dark:text-white">{item.subject}</p>
                  <p className="mt-0.5 text-[0.66rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                    {item.recipient}
                  </p>
                </div>
                <Badge tone={item.status === "failed" ? "rose" : "amber"} size="sm">
                  {item.status === "failed" ? "ناموفق" : "در صف"}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <ButtonLink href="/admin/notifications" size="sm" variant="outline" icon="refresh" full>
              مدیریت و تلاش مجدد
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* آخرین درخواست‌ها */}
      <div className="mt-6">
        <SectionHeading
          align="start"
          eyebrow="آخرین فعالیت‌ها"
          icon="inbox"
          title="تازه‌ترین درخواست‌ها"
          description="برای مشاهده جزئیات، مدارک و تغییر وضعیت روی هر ردیف کلیک کنید."
        />
        <div className="mt-5">
          <TableShell>
            <table className="w-full min-w-[54rem] text-start text-[0.78rem]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/60 text-[0.68rem] font-black text-ink-500 dark:text-ink-400">
                  <th className="p-3 text-start">کد پیگیری</th>
                  <th className="p-3 text-start">متقاضی</th>
                  <th className="p-3 text-start">خدمت</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">اولویت</th>
                  <th className="p-3 text-start">بررسی‌کننده</th>
                  <th className="p-3 text-start">ثبت</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {recent.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-[var(--border-soft)] last:border-0 transition hover:bg-brand-50/50 dark:hover:bg-brand-500/5"
                  >
                    <td className="p-3">
                      <span className="numeric font-black text-brand-700 dark:text-brand-300" dir="ltr">
                        {request.trackingCode}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={request.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-black text-ink-900 dark:text-white">{request.fullName}</p>
                          <p className="numeric text-[0.66rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                            {request.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-ink-700 dark:text-ink-200">{request.serviceTitle}</td>
                    <td className="p-3">
                      <Badge tone={STATUS_META[request.status].tone} dot>
                        {STATUS_META[request.status].label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Tooltip content={PRIORITY_META[request.priority].label}>
                        <span className="inline-flex items-center gap-1.5 font-bold text-ink-600 dark:text-ink-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_META[request.priority].color }} />
                          {PRIORITY_META[request.priority].label}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="p-3 font-bold text-ink-600 dark:text-ink-300">{request.assignee || "—"}</td>
                    <td className="p-3">
                      <span className="font-bold text-ink-600 dark:text-ink-300">{timeAgo(request.createdAt)}</span>
                      <span className="mt-0.5 block text-[0.62rem] font-bold text-ink-400">
                        {formatDate(request.createdAt, "short")}
                      </span>
                    </td>
                    <td className="p-3 text-end">
                      <Link
                        href={`/admin/requests/${request.trackingCode}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-2 text-[0.7rem] font-black text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200"
                      >
                        بررسی
                        <Icon name="chevronLeft" size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </div>

      {/* سابقه رویدادها و دسترسی سریع */}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-ink-900 dark:text-white">آخرین رویدادهای سامانه</h2>
            <Link href="/admin/audit" className="text-[0.72rem] font-black text-brand-700 hover:underline dark:text-brand-300">
              سابقه کامل
            </Link>
          </div>
          <ol className="mt-4 space-y-3">
            {recentAudit.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    entry.severity === "critical" ? "bg-rose-500" : entry.severity === "warning" ? "bg-amber-500" : "bg-brand-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.76rem] font-bold text-ink-700 dark:text-ink-200">{entry.detail}</p>
                  <p className="mt-0.5 text-[0.64rem] font-bold text-ink-400 dark:text-ink-500">
                    {entry.actor} • {timeAgo(entry.at)} • {formatDate(entry.at, "datetime")}
                  </p>
                </div>
              </li>
            ))}
            {recentAudit.length === 0 && (
              <li className="text-[0.78rem] font-bold text-ink-500 dark:text-ink-400">رویدادی ثبت نشده است.</li>
            )}
          </ol>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Metric label="درخواست‌های در جریان" value={faNumber(activeCount)} icon="activity" tone="info" />
          <Metric label="مدارک بارگذاری‌شده" value={faNumber(stats.attachments)} icon="folder" tone="gold" />
          <Metric label="اعلان‌های ارسال‌شده" value={faNumber(state.notifications.filter((n) => n.status === "sent").length)} icon="checkCircle" tone="success" />
          <Metric label="رویدادهای ثبت‌شده" value={faNumber(state.audit.length)} icon="archive" />
          <div className="sm:col-span-2">
            <Card className="p-5">
              <h2 className="font-black text-ink-900 dark:text-white">دسترسی سریع</h2>
              <div className="mt-4 grid gap-2.5">
                <ButtonLink href="/admin/requests" variant="outline" size="sm" icon="inbox" full>
                  کارتابل درخواست‌ها
                </ButtonLink>
                <ButtonLink href="/admin/articles" variant="outline" size="sm" icon="book" full>
                  مدیریت مقالات و راهنماها
                </ButtonLink>
                <ButtonLink href="/admin/settings" variant="outline" size="sm" icon="gear" full>
                  تنظیمات سامانه
                </ButtonLink>
                <ButtonLink href="/track" size="sm" icon="track" full>
                  صفحه پیگیری مراجعان
                </ButtonLink>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
