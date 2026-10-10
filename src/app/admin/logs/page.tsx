import { requirePermission } from "@/lib/auth/guard";
import { recentAuditLogs } from "@/lib/audit";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "سابقه رویدادها" };

export default async function LogsPage() {
  await requirePermission("logs.view");
  const rows = await recentAuditLogs(300);
  return (
    <div className="space-y-6">
      <PageHeader title="سابقه رویدادها و دسترسی‌ها" desc="ثبت تغییرات، دانلود مدارک، خروجی‌ها و تلاش‌های ورود. اطلاعات شخصی متقاضی در این سابقه ذخیره نمی‌شود." />
      <Card>
        {rows.length === 0 ? <EmptyState>رویدادی ثبت نشده است.</EmptyState> : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr><th className="px-2 py-3">زمان</th><th className="px-2 py-3">کاربر</th><th className="px-2 py-3">نقش</th><th className="px-2 py-3">رویداد</th><th className="px-2 py-3">موجودیت</th><th className="px-2 py-3">جزئیات</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-2 py-2 text-xs whitespace-nowrap">{formatFaDate(r.created_at)}</td>
                    <td className="px-2 py-2">{r.actor_name || "—"}</td>
                    <td className="px-2 py-2 text-xs">{r.actor_role || "—"}</td>
                    <td className="px-2 py-2 font-mono text-xs" dir="ltr">{r.action}</td>
                    <td className="px-2 py-2 text-xs">{r.entity_type}{r.entity_id ? <span className="block font-mono text-[10px] text-slate-500" dir="ltr">{r.entity_id.slice(0, 8)}</span> : null}</td>
                    <td className="max-w-xs px-2 py-2 font-mono text-[11px] text-slate-600" dir="ltr">{r.meta_json !== "{}" ? r.meta_json : ""}</td>
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
