import { Field, inputClass } from "@/components/field";
import { btn } from "@/components/admin/ui";
import { saveArticleAction, deleteArticleAction } from "@/app/admin/_actions/content";
import { ConfirmForm } from "@/components/admin/confirm-form";

export interface ArticleFormValues {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  body_md?: string;
  author?: string;
  category?: string;
  status?: string;
  seo_title?: string;
  seo_description?: string;
  review_note?: string;
  related_services?: string[];
}

export function ArticleForm({ article, services }: { article?: ArticleFormValues; services: Array<{ slug: string; title: string }> }) {
  const a = article || {};
  const related = new Set(a.related_services || []);
  return (
    <div className="space-y-6">
      <form action={saveArticleAction} className="grid gap-5">
        {a.id && <input type="hidden" name="id" value={a.id} />}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="عنوان" name="title" required><input id="title" name="title" required minLength={5} maxLength={200} defaultValue={a.title} className={inputClass} /></Field>
          <Field label="نامک (slug) — لاتین" name="slug" hint="فقط حروف لاتین کوچک، عدد و خط تیره. خالی بماند تا از عنوان ساخته شود.">
            <input id="slug" name="slug" dir="ltr" maxLength={120} defaultValue={a.slug} className={`${inputClass} text-left`} />
          </Field>
          <Field label="دسته‌بندی" name="category"><input id="category" name="category" maxLength={80} defaultValue={a.category} className={inputClass} /></Field>
          <Field label="نویسنده" name="author" hint="خالی بماند تا نام دفتر نمایش داده شود."><input id="author" name="author" maxLength={120} defaultValue={a.author} className={inputClass} /></Field>
        </div>
        <Field label="خلاصه" name="excerpt"><textarea id="excerpt" name="excerpt" rows={2} maxLength={400} defaultValue={a.excerpt} className={inputClass} /></Field>
        <Field label="متن مقاله (Markdown)" name="body" required hint="برای فهرست مطالب از «## عنوان» استفاده کنید. HTML خام پذیرفته نمی‌شود.">
          <textarea id="body" name="body" required rows={18} minLength={20} maxLength={60000} defaultValue={a.body_md} className={`${inputClass} font-mono text-sm leading-7`} />
        </Field>
        <fieldset className="rounded-2xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-bold">خدمات مرتبط</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label key={s.slug} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="relatedServices" value={s.slug} defaultChecked={related.has(s.slug)} className="h-4 w-4 accent-brand-700" /> {s.title}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="عنوان سئو" name="seoTitle"><input id="seoTitle" name="seoTitle" maxLength={160} defaultValue={a.seo_title} className={inputClass} /></Field>
          <Field label="توضیحات متا" name="seoDescription"><textarea id="seoDescription" name="seoDescription" rows={2} maxLength={320} defaultValue={a.seo_description} className={inputClass} /></Field>
          <Field label="یادداشت بازبینی (داخلی)" name="reviewNote" hint="مثلاً: «بازبینی مقررات توسط دفتر لازم است»."><input id="reviewNote" name="reviewNote" maxLength={500} defaultValue={a.review_note} className={inputClass} /></Field>
          <Field label="وضعیت" name="status">
            <select id="status" name="status" className={inputClass} defaultValue={a.status || "draft"}>
              <option value="draft">پیش‌نویس (منتشر نشود)</option>
              <option value="published">منتشر شود</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btn.primary}>ذخیره</button>
          {a.id && <a href={`/admin/content/articles/${a.id}/preview`} className={btn.ghost}>پیش‌نمایش</a>}
        </div>
      </form>
      {a.id && (
        <ConfirmForm action={deleteArticleAction} message="این مقاله برای همیشه حذف شود؟">
          <input type="hidden" name="id" value={a.id} />
          <button type="submit" className="text-sm font-bold text-rose-700">حذف مقاله</button>
        </ConfirmForm>
      )}
    </div>
  );
}
