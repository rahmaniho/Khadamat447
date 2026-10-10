import { requirePermission } from "@/lib/auth/guard";
import { getFaqsForAdmin, getAllServicesForAdmin } from "@/lib/queries";
import { PageHeader, Card, EmptyState, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Field, inputClass } from "@/components/field";
import { saveFaqAction, deleteFaqAction } from "@/app/admin/_actions/content";

export const metadata = { title: "سؤالات متداول" };

export default async function AdminFaqsPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("content.faqs");
  const sp = await searchParams;
  const [faqs, services] = await Promise.all([getFaqsForAdmin(), getAllServicesForAdmin()]);
  return (
    <div className="space-y-6">
      <PageHeader title="سؤالات متداول" desc="افزودن، ویرایش و انتشار پرسش و پاسخ‌ها. پاسخ‌ها Markdown ساده هستند (HTML خام پذیرفته نمی‌شود)." />
      <Flash msg={sp.msg} err={sp.err} />

      <Card title="سؤال جدید">
        <form action={saveFaqAction} className="grid gap-4">
          <Field label="پرسش" name="question" required><input id="question" name="question" required maxLength={300} className={inputClass} /></Field>
          <Field label="پاسخ" name="answer" required hint="پاسخ باید از اطلاعات تأییدشده دفتر یا مقررات رسمی استخراج شود."><textarea id="answer" name="answer" required rows={4} maxLength={4000} className={inputClass} /></Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="خدمت مرتبط" name="serviceSlug">
              <select id="serviceSlug" name="serviceSlug" className={inputClass} defaultValue="">
                <option value="">عمومی (صفحه سؤالات متداول)</option>
                {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              </select>
            </Field>
            <Field label="ترتیب" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={99} className={inputClass} /></Field>
            <label className="mt-7 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-brand-700" /> منتشر شود</label>
          </div>
          <button type="submit" className={`${btn.primary} justify-self-start`}>افزودن</button>
        </form>
      </Card>

      <Card title={`فهرست (${faqs.length})`}>
        {faqs.length === 0 ? <EmptyState>سؤالی ثبت نشده است.</EmptyState> : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.id} className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-bold">{f.question} {!f.published && <span className="text-xs text-amber-700">(پیش‌نویس)</span>}</summary>
                <form action={saveFaqAction} className="mt-4 grid gap-4">
                  <input type="hidden" name="id" value={f.id} />
                  <Field label="پرسش" name={`q-${f.id}`} required><input id={`q-${f.id}`} name="question" defaultValue={f.question} required maxLength={300} className={inputClass} /></Field>
                  <Field label="پاسخ" name={`a-${f.id}`} required><textarea id={`a-${f.id}`} name="answer" defaultValue={f.answer_md} required rows={4} maxLength={4000} className={inputClass} /></Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="خدمت مرتبط" name={`s-${f.id}`}>
                      <select id={`s-${f.id}`} name="serviceSlug" defaultValue={f.service_slug ?? ""} className={inputClass}>
                        <option value="">عمومی</option>
                        {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
                      </select>
                    </Field>
                    <Field label="ترتیب" name={`o-${f.id}`}><input id={`o-${f.id}`} name="sortOrder" type="number" min={0} defaultValue={f.sort_order} className={inputClass} /></Field>
                    <label className="mt-7 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={f.published} className="h-4 w-4 accent-brand-700" /> منتشر شود</label>
                  </div>
                  <button type="submit" className={`${btn.primary} justify-self-start`}>ذخیره</button>
                </form>
                <ConfirmForm action={deleteFaqAction} message="این سؤال حذف شود؟" className="mt-3">
                  <input type="hidden" name="id" value={f.id} />
                  <button type="submit" className="text-sm font-bold text-rose-700">حذف سؤال</button>
                </ConfirmForm>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
