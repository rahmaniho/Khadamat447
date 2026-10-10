import { requirePermission } from "@/lib/auth/guard";
import { all } from "@/lib/db";
import { PageHeader, Card, EmptyState, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Field, inputClass } from "@/components/field";
import { saveAnnouncementAction, deleteAnnouncementAction } from "@/app/admin/_actions/content";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "اطلاعیه‌ها" };

type Row = { id: string; title: string; body_md: string; kind: string; active: number; starts_at: string | null; ends_at: string | null };

export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("content.announcements");
  const sp = await searchParams;
  const rows = await all<Row>("SELECT * FROM announcements ORDER BY created_at DESC");
  return (
    <div className="space-y-6">
      <PageHeader title="اطلاعیه‌های مهم" desc="اطلاعیه‌های فعال در بالای همه صفحات عمومی نمایش داده می‌شوند (حداکثر ۳ مورد)." />
      <Flash msg={sp.msg} err={sp.err} />
      <Card title="اطلاعیه جدید">
        <form action={saveAnnouncementAction} className="grid gap-4 md:grid-cols-2">
          <Field label="عنوان" name="title" required><input id="title" name="title" required maxLength={160} className={inputClass} /></Field>
          <Field label="نوع" name="kind"><select id="kind" name="kind" className={inputClass} defaultValue="info"><option value="info">اطلاع‌رسانی</option><option value="warning">هشدار</option><option value="success">خبر خوش</option></select></Field>
          <div className="md:col-span-2"><Field label="متن" name="body"><textarea id="body" name="body" rows={2} maxLength={2000} className={inputClass} /></Field></div>
          <Field label="شروع نمایش (اختیاری)" name="startsAt"><input id="startsAt" name="startsAt" type="datetime-local" dir="ltr" className={`${inputClass} text-left`} /></Field>
          <Field label="پایان نمایش (اختیاری)" name="endsAt"><input id="endsAt" name="endsAt" type="datetime-local" dir="ltr" className={`${inputClass} text-left`} /></Field>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-brand-700" /> فعال باشد</label>
          <div><button type="submit" className={btn.primary}>ذخیره اطلاعیه</button></div>
        </form>
      </Card>
      <Card title="فهرست اطلاعیه‌ها">
        {rows.length === 0 ? <EmptyState>اطلاعیه‌ای ثبت نشده است.</EmptyState> : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-bold">{r.title} {!r.active && <span className="text-xs text-slate-500">(غیرفعال)</span>}</p>
                  <p className="text-xs text-slate-500">{r.body_md}</p>
                  {(r.starts_at || r.ends_at) && <p className="text-xs text-slate-500">بازه: {formatFaDate(r.starts_at, false)} تا {formatFaDate(r.ends_at, false)}</p>}
                </div>
                <ConfirmForm action={deleteAnnouncementAction} message="اطلاعیه حذف شود؟">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-sm font-bold text-rose-700">حذف</button>
                </ConfirmForm>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
