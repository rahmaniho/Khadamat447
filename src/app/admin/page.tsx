import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { dashboardStats, requestsPerDay } from "@/lib/queries";
import { recentAuditLogs } from "@/lib/audit";
import { notificationHealth } from "@/lib/notifications";
import { PageHeader, Card, Stat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import { formatFaDate, toFaDigits } from "@/lib/utils";
import { notificationReadinessWarning } from "@/lib/notifications";
import { Alert } from "@/components/ui";

export const metadata = { title: "داشبورد" };

export default async function DashboardPage() {
  const user = await requirePermission("dashboard.view");
  const stats = await dashboardStats();
  const perDay = await requestsPerDay(14);
  const activity = user.role === "owner" ? await recentAuditLogs(10) : [];
  const health = await notificationHealth();
  const warning = notificationReadinessWarning();
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));

  return (
    <div className="space-y-6">
      <PageHeader title={`خوش آمدید، ${user.name}`} desc="خلاصه وضعیت درخواست‌ها و اعلان‌ها" actions={<Link href="/admin/requests" className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white">مشاهده درخواست‌ها</Link>} />

      {warning && <Alert tone="warning">{warning}</Alert>}
      {health.failed > 0 && (
        <Alert tone="warning">
          {toFaDigits(health.failed)} اعلان ناموفق وجود دارد. از <Link className="font-bold underline" href="/admin/notifications">صفحه اعلان‌ها</Link> می‌توانید دوباره ارسال کنید.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="کل درخواست‌ها" value={toFaDigits(stats.total)} />
        <Stat label="ثبت امروز" value={toFaDigits(stats.today)} />
        <Stat label="۷ روز اخیر" value={toFaDigits(stats.last7Days)} />
        <Stat label="در انتظار بررسی" value={toFaDigits((stats.byStatus.new || 0) + (stats.byStatus.pending_review || 0))} hint="ثبت اولیه + در انتظار بررسی" />
        <Stat label="نیازمند تکمیل اطلاعات" value={toFaDigits(stats.byStatus.needs_info || 0)} />
        <Stat label="در حال بررسی" value={toFaDigits((stats.byStatus.in_review || 0) + (stats.byStatus.ready_to_report || 0))} />
        <Stat label="تکمیل‌شده" value={toFaDigits(stats.byStatus.completed || 0)} />
        <Stat label="اعلان‌های در صف / ناموفق" value={`${toFaDigits(health.pending)} / ${toFaDigits(health.failed)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="درخواست‌ها بر اساس وضعیت">
          <ul className="space-y-3">
            {(Object.keys(REQUEST_STATUSES) as RequestStatus[]).map((k) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <StatusBadge status={k} />
                <span className="font-black">{toFaDigits(stats.byStatus[k] || 0)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="درخواست‌ها بر اساس خدمت">
          {stats.byService.length === 0 ? (
            <EmptyState>هنوز درخواستی ثبت نشده است.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {stats.byService.map((s) => (
                <li key={s.slug} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{s.title}</span>
                  <span className="font-black">{toFaDigits(s.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="درخواست‌های ۱۴ روز اخیر">
        {perDay.length === 0 ? (
          <EmptyState>در این بازه درخواستی ثبت نشده است.</EmptyState>
        ) : (
          <div className="flex h-44 items-end gap-2 overflow-x-auto pb-2" role="img" aria-label="نمودار ستونی درخواست‌های روزانه">
            {perDay.map((d) => (
              <div key={d.day} className="flex min-w-[2rem] flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{toFaDigits(d.count)}</span>
                <div className="w-full rounded-t-xl bg-brand-500" style={{ height: `${(d.count / maxDay) * 120 + 4}px` }} />
                <span className="ltr-num text-[10px] text-slate-500">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {user.role === "owner" && (
        <Card title="آخرین فعالیت‌های کاربران مجاز" actions={<Link href="/admin/logs" className="text-sm font-bold text-brand-700">همه رویدادها</Link>}>
          {activity.length === 0 ? (
            <EmptyState>فعالیتی ثبت نشده است.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span><strong>{a.actor_name || "سامانه"}</strong> — {a.action}</span>
                  <span className="text-xs text-slate-500">{formatFaDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
