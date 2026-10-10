import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getServiceById } from "@/lib/queries";
import { all } from "@/lib/db";
import { PageHeader, Card, btn, EmptyState } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Field, inputClass } from "@/components/field";
import { saveServiceAction, addServiceFieldAction, toggleServiceFieldAction, deleteServiceFieldAction } from "@/app/admin/_actions/content";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "ویرایش خدمت" };

type FieldRow = { id: string; field_key: string; label: string; type: string; options_json: string; required: number; active: number; sort_order: number };

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("content.services");
  const { id } = await params;
  const sp = await searchParams;
  const s = await getServiceById(id);
  if (!s) notFound();
  const fields = await all<FieldRow>("SELECT * FROM service_fields WHERE service_id = ? ORDER BY sort_order ASC", [id]);

  return (
    <div className="space-y-6">
      <PageHeader title={`ویرایش: ${s.title}`} desc={`نشانی عمومی: /services/${s.slug}`} actions={<Link className={btn.ghost} href={`/services/${s.slug}`} target="_blank">مشاهده صفحه عمومی</Link>} />
      <Flash msg={sp.msg} err={sp.err} />

      <Card title="محتوا و سئو">
        <form action={saveServiceAction} className="grid gap-5">
          <input type="hidden" name="id" value={s.id} />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="عنوان خدمت" name="title" required><input id="title" name="title" required defaultValue={s.title} maxLength={160} className={inputClass} /></Field>
            <Field label="ترتیب نمایش" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={s.sort_order} className={inputClass} /></Field>
            <Field label="شعار کوتاه" name="tagline"><input id="tagline" name="tagline" defaultValue={s.tagline} maxLength={240} className={inputClass} /></Field>
            <Field label="حداکثر تعداد فایل" name="maxAttachments"><input id="maxAttachments" name="maxAttachments" type="number" min={0} max={10} defaultValue={s.max_attachments} className={inputClass} /></Field>
          </div>
          <Field label="خلاصه (نمایش در کارت و متا)" name="summary"><textarea id="summary" name="summary" rows={2} maxLength={600} defaultValue={s.summary} className={inputClass} /></Field>
          <Field label="معرفی خدمت (Markdown)" name="intro"><textarea id="intro" name="intro" rows={6} maxLength={20000} defaultValue={s.intro_md} className={`${inputClass} font-mono text-sm`} /></Field>
          <Field label="مخاطبان (Markdown)" name="audience"><textarea id="audience" name="audience" rows={4} maxLength={20000} defaultValue={s.audience_md} className={`${inputClass} font-mono text-sm`} /></Field>
          <Field label="مراحل ثبت درخواست (Markdown)" name="process"><textarea id="process" name="process" rows={6} maxLength={20000} defaultValue={s.process_md} className={`${inputClass} font-mono text-sm`} /></Field>
          <Field label="مدارک موردنیاز (Markdown)" name="documents" hint="فقط مدارکی را بنویسید که دفتر تأیید کرده است. تا زمان تأیید، صفحه با برچسب «در انتظار بازبینی» نمایش داده می‌شود."><textarea id="documents" name="documents" rows={6} maxLength={20000} defaultValue={s.documents_md} className={`${inputClass} font-mono text-sm`} /></Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="عنوان سئو" name="seoTitle" hint="پیشنهاد: حداکثر ۶۰ نویسه"><input id="seoTitle" name="seoTitle" defaultValue={s.seo_title} maxLength={160} className={inputClass} /></Field>
            <Field label="توضیحات متا" name="seoDescription" hint="پیشنهاد: ۱۵۰ تا ۱۶۰ نویسه"><textarea id="seoDescription" name="seoDescription" rows={2} maxLength={320} defaultValue={s.seo_description} className={inputClass} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={s.active} className="h-4 w-4 accent-brand-700" /> نمایش عمومی و فرم فعال</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="allowAttachments" defaultChecked={s.allow_attachments} className="h-4 w-4 accent-brand-700" /> امکان بارگذاری مدرک</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="markReviewed" className="h-4 w-4 accent-brand-700" /> تأیید بازبینی دفتر (هم‌اکنون)</label>
          </div>
          <p className="text-xs text-slate-500">آخرین بازبینی: {s.reviewed_at ? formatFaDate(s.reviewed_at) : "ثبت نشده"}</p>
          <button type="submit" className={`${btn.primary} justify-self-start`}>ذخیره خدمت</button>
        </form>
      </Card>

      <Card title="فیلدهای اختصاصی فرم">
        {fields.length === 0 ? (
          <EmptyState>فیلد اختصاصی تعریف نشده است.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {fields.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-bold">{f.label} {f.required ? <span className="text-xs text-rose-600">(الزامی)</span> : null}</p>
                  <p className="text-xs text-slate-500">کلید: <span dir="ltr">{f.field_key}</span> · نوع: {f.type} {f.options_json !== "[]" ? `· گزینه‌ها: ${JSON.parse(f.options_json).join("، ")}` : ""} · {f.active ? "فعال" : "غیرفعال"}</p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleServiceFieldAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="serviceId" value={s.id} />
                    <button type="submit" className={btn.ghost}>{f.active ? "غیرفعال‌سازی" : "فعال‌سازی"}</button>
                  </form>
                  <ConfirmForm action={deleteServiceFieldAction} message="این فیلد حذف شود؟">
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="serviceId" value={s.id} />
                    <button type="submit" className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-700">حذف</button>
                  </ConfirmForm>
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="mt-6 rounded-2xl border border-dashed border-brand-200 p-5">
          <summary className="cursor-pointer font-extrabold text-brand-800">افزودن فیلد جدید</summary>
          <form action={addServiceFieldAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="serviceId" value={s.id} />
            <Field label="کلید فیلد (لاتین، بدون فاصله)" name="fieldKey" required hint="مثال: preferred_date"><input id="fieldKey" name="fieldKey" required pattern="[a-z][a-z0-9_]{1,40}" dir="ltr" className={`${inputClass} text-left`} /></Field>
            <Field label="برچسب" name="label" required><input id="label" name="label" required maxLength={120} className={inputClass} /></Field>
            <Field label="نوع فیلد" name="type"><select id="type" name="type" className={inputClass} defaultValue="text"><option value="text">متن کوتاه</option><option value="textarea">متن بلند</option><option value="select">فهرست انتخابی</option><option value="number">عدد</option></select></Field>
            <Field label="ترتیب" name="sortOrder"><input id="sortOrder2" name="sortOrder" type="number" min={0} max={999} defaultValue={99} className={inputClass} /></Field>
            <Field label="گزینه‌ها (برای فهرست انتخابی؛ هر خط یک گزینه)" name="options"><textarea id="options" name="options" rows={3} className={inputClass} /></Field>
            <Field label="راهنما / متن نمونه" name="placeholder"><input id="placeholder" name="placeholder" maxLength={160} className={inputClass} /></Field>
            <Field label="توضیح کوتاه زیر فیلد" name="helpText"><input id="helpText" name="helpText" maxLength={300} className={inputClass} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="required" className="h-4 w-4 accent-brand-700" /> الزامی باشد</label>
            <div><button type="submit" className={btn.primary}>افزودن فیلد</button></div>
          </form>
        </details>
      </Card>
    </div>
  );
}
