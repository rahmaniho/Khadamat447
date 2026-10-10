import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { listRequests } from "@/lib/queries";
import { getAllServicesForAdmin } from "@/lib/queries";
import { PageHeader, Card, StatusBadge, EmptyState, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { Field, inputClass } from "@/components/field";
import { REQUEST_STATUSES, REQUEST_STATUS_KEYS, roleHasPermission } from "@/lib/constants";
import { formatFaDate, toFaDigits } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "درخواست‌ها" };

const PAGE_SIZE = 25;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; service?: string; from?: string; to?: string; page?: string; archived?: string; msg?: string; err?: string }>;
}) {
  await requirePermission("requests.view");
  const sp = await searchParams;
  const user = await getSessionUser();
  const page = Math.max(1, Number(sp.page || 1));
  const services = await getAllServicesForAdmin();
  const { rows, total } = await listRequests({
    q: sp.q?.slice(0, 100),
    status: sp.status,
    serviceSlug: sp.service,
    from: sp.from,
    to: sp.to,
    archived: sp.archived === "1",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({ ...sp, ...overrides } as Record<string, string>);
    p.delete("msg");
    p.delete("err");
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/admin/requests?${p.toString()}`;
  };
  const canExport = user ? roleHasPermission(user.role, "requests.export") : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت درخواست‌ها"
        desc={`${toFaDigits(total)} درخواست با فیلترهای فعلی`}
        actions={
          canExport ? (
            <a href={`/admin/requests/export?status=${encodeURIComponent(sp.status || "")}`} className={btn.ghost}>خروجی CSV (حداقل اطلاعات)</a>
          ) : null
        }
      />
      <Flash msg={sp.msg} err={sp.err} />

      <Card>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6" role="search">
          <div className="xl:col-span-2">
            <Field label="جست‌وجو (کد پیگیری، نام، شماره، مجموعه)" name="q">
              <input id="q" name="q" defaultValue={sp.q || ""} maxLength={100} className={inputClass} />
            </Field>
          </div>
          <Field label="وضعیت" name="status">
            <select id="status" name="status" defaultValue={sp.status || ""} className={inputClass}>
              <option value="">همه</option>
              {REQUEST_STATUS_KEYS.map((k) => (
                <option key={k} value={k}>{REQUEST_STATUSES[k].label}</option>
              ))}
            </select>
          </Field>
          <Field label="خدمت" name="service">
            <select id="service" name="service" defaultValue={sp.service || ""} className={inputClass}>
              <option value="">همه</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
          </Field>
          <Field label="از تاریخ (میلادی)" name="from">
            <input id="from" name="from" type="date" dir="ltr" defaultValue={sp.from || ""} className={`${inputClass} text-left`} />
          </Field>
          <Field label="تا تاریخ (میلادی)" name="to">
            <input id="to" name="to" type="date" dir="ltr" defaultValue={sp.to || ""} className={`${inputClass} text-left`} />
          </Field>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="archived" value="1" defaultChecked={sp.archived === "1"} className="h-4 w-4 accent-brand-700" /> نمایش بایگانی‌شده‌ها
            </label>
            <button type="submit" className={btn.primary}>اعمال فیلتر</button>
            <Link href="/admin/requests" className={btn.ghost}>پاک‌کردن</Link>
          </div>
        </form>
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState>درخواستی با این فیلترها پیدا نشد.</EmptyState>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-3 font-bold">کد پیگیری</th>
                  <th className="px-2 py-3 font-bold">خدمت</th>
                  <th className="px-2 py-3 font-bold">متقاضی</th>
                  <th className="px-2 py-3 font-bold">وضعیت</th>
                  <th className="px-2 py-3 font-bold">زمان ثبت</th>
                  <th className="px-2 py-3 font-bold">اعلان</th>
                  <th className="px-2 py-3 font-bold"><span className="sr-only">عملیات</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-2 py-3"><span className="ltr-num font-mono text-xs font-bold" dir="ltr">{r.tracking_code}</span></td>
                    <td className="px-2 py-3">{r.service_title}</td>
                    <td className="px-2 py-3">{r.full_name}{r.org_name ? <span className="block text-xs text-slate-500">{r.org_name}</span> : null}</td>
                    <td className="px-2 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-2 py-3 text-xs text-slate-600">{formatFaDate(r.created_at)}</td>
                    <td className="px-2 py-3 text-xs text-slate-600">{r.notification_state}</td>
                    <td className="px-2 py-3">
                      <Link href={`/admin/requests/${r.id}`} className="font-bold text-brand-700 underline">جزئیات</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="صفحات" className="mt-6 flex items-center justify-between gap-3 text-sm">
            {page > 1 ? <Link className={btn.ghost} href={qs({ page: String(page - 1) })}>قبلی</Link> : <span />}
            <span>صفحه {toFaDigits(page)} از {toFaDigits(pages)}</span>
            {page < pages ? <Link className={btn.ghost} href={qs({ page: String(page + 1) })}>بعدی</Link> : <span />}
          </nav>
        )}
      </Card>
    </div>
  );
}
