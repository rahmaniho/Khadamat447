import { requirePermission } from "@/lib/auth/guard";
import { recentNotifications, notificationHealth, notificationReadinessWarning } from "@/lib/notifications";
import { PageHeader, Card, EmptyState, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { Alert } from "@/components/ui";
import { retryNotificationAction, dispatchPendingAction } from "@/app/admin/_actions/notifications";
import { formatFaDate, toFaDigits } from "@/lib/utils";

export const metadata = { title: "اعلان‌ها" };

const KIND: Record<string, string> = {
  admin_new_request: "اعلان درخواست جدید (مدیر)",
  applicant_confirmation: "تأیید ثبت (متقاضی)",
  status_change: "تغییر وضعیت (متقاضی)",
};
const STATUS: Record<string, string> = { sent: "ارسال‌شده", failed: "ناموفق", pending: "در صف", skipped: "پیکربندی‌نشده" };

/** نمایش نشانی ایمیل گیرنده به‌صورت ناقص برای جلوگیری از افشا */
function maskRecipient(r: string): string {
  if (!r.includes("@")) return r === "telegram-chat" ? "تلگرام" : "***";
  const [u, d] = r.split("@");
  return `${u.slice(0, 2)}***@${d}`;
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("notifications.view");
  const sp = await searchParams;
  const rows = await recentNotifications(60);
  const health = await notificationHealth();
  const warning = notificationReadinessWarning();
  return (
    <div className="space-y-6">
      <PageHeader
        title="اعلان‌ها"
        desc="وضعیت ارسال ایمیل و تلگرام. اعلان‌های ناموفق دوباره قابل ارسال هستند؛ درخواست کاربر هرگز به‌دلیل خطای اعلان حذف نمی‌شود."
        actions={
          <form action={dispatchPendingAction}>
            <button type="submit" className={btn.primary}>ارسال اعلان‌های در صف</button>
          </form>
        }
      />
      <Flash msg={sp.msg} err={sp.err} />
      {warning && <Alert tone="warning">{warning}</Alert>}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-slate-600">ایمیل</p><p className="mt-1 font-black">{health.emailConfigured ? `فعال (${health.emailProvider})` : "غیرفعال"}</p></Card>
        <Card><p className="text-sm text-slate-600">تلگرام</p><p className="mt-1 font-black">{health.telegramConfigured ? "فعال" : "غیرفعال"}</p></Card>
        <Card><p className="text-sm text-slate-600">در صف</p><p className="mt-1 font-black">{toFaDigits(health.pending)}</p></Card>
        <Card><p className="text-sm text-slate-600">ناموفق</p><p className="mt-1 font-black text-rose-700">{toFaDigits(health.failed)}</p></Card>
      </div>

      <Card title="آخرین اعلان‌ها">
        {rows.length === 0 ? <EmptyState>اعلانی ثبت نشده است.</EmptyState> : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr><th className="px-2 py-3">نوع</th><th className="px-2 py-3">گیرنده</th><th className="px-2 py-3">وضعیت</th><th className="px-2 py-3">تلاش‌ها</th><th className="px-2 py-3">خطا</th><th className="px-2 py-3">زمان</th><th className="px-2 py-3"><span className="sr-only">عملیات</span></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((n) => (
                  <tr key={n.id} className="align-top">
                    <td className="px-2 py-3">{KIND[n.kind] ?? n.kind}</td>
                    <td className="px-2 py-3 ltr-num" dir="ltr">{maskRecipient(n.recipient)}</td>
                    <td className="px-2 py-3 font-bold">{STATUS[n.status] ?? n.status}</td>
                    <td className="px-2 py-3">{toFaDigits(n.attempts)}</td>
                    <td className="max-w-xs px-2 py-3 text-xs text-rose-700">{n.last_error}</td>
                    <td className="px-2 py-3 text-xs">{formatFaDate(n.created_at)}</td>
                    <td className="px-2 py-3">
                      {(n.status === "failed" || n.status === "pending") && (
                        <form action={retryNotificationAction}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" className={btn.ghost}>ارسال مجدد</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
