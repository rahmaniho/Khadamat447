"use server";

import { redirect } from "next/navigation";
import { get, run, nowIso } from "@/lib/db";
import { newId, slugify } from "@/lib/utils";
import { requirePermission } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { flashPath } from "@/lib/admin-flash";
import { cleanText, faqSchema, articleSchema, serviceSchema, serviceFieldSchema, announcementSchema } from "@/lib/validation";
import { setSettings, invalidateSettingsCache } from "@/lib/settings";
import { ALLOWED_SETTING_KEYS } from "@/lib/settings-schema";
import { validateSettingValue, fieldByKey } from "@/lib/settings-validate";
import { ensureBootstrap } from "@/lib/bootstrap";

const actor = (u: { id: string; name: string; role: string }) => ({ id: u.id, name: u.name, role: u.role });
const bool = (fd: FormData, k: string) => fd.get(k) === "on";
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

/* ------------------------------ خدمات ------------------------------ */

export async function saveServiceAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.services");
  const id = str(formData, "id");
  const parsed = serviceSchema.safeParse({
    id,
    title: str(formData, "title"),
    tagline: str(formData, "tagline"),
    summary: str(formData, "summary"),
    intro: str(formData, "intro"),
    audience: str(formData, "audience"),
    process: str(formData, "process"),
    documents: str(formData, "documents"),
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    active: bool(formData, "active"),
    allowAttachments: bool(formData, "allowAttachments"),
    maxAttachments: formData.get("maxAttachments") ?? 0,
    sortOrder: formData.get("sortOrder") ?? 0,
    markReviewed: bool(formData, "markReviewed"),
  });
  const back = `/admin/content/services/${encodeURIComponent(id)}`;
  if (!parsed.success) redirect(flashPath(back, parsed.error.issues[0]?.message || "اطلاعات خدمت نامعتبر است.", "err"));
  const d = parsed.data;
  const current = await get<{ reviewed_at: string | null }>("SELECT reviewed_at FROM services WHERE id = ?", [id]);
  if (!current) redirect("/admin/content/services");
  const reviewedAt = d.markReviewed ? nowIso() : current.reviewed_at;
  await run(
    `UPDATE services SET title=?, tagline=?, summary=?, intro_md=?, audience_md=?, process_md=?, documents_md=?,
       seo_title=?, seo_description=?, active=?, allow_attachments=?, max_attachments=?, sort_order=?, reviewed_at=?, updated_at=?
     WHERE id=?`,
    [
      d.title, cleanText(d.tagline || "", 240), cleanText(d.summary || "", 600), d.intro || "", d.audience || "", d.process || "", d.documents || "",
      cleanText(d.seoTitle || "", 160), cleanText(d.seoDescription || "", 320), d.active ? 1 : 0, d.allowAttachments ? 1 : 0,
      d.maxAttachments ?? 4, d.sortOrder ?? 0, reviewedAt, nowIso(), id,
    ],
  );
  await logAudit(actor(user), "service.updated", { type: "service", id }, { reviewed: Boolean(d.markReviewed) });
  redirect(flashPath(back, "خدمت ذخیره شد."));
}

export async function addServiceFieldAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.services");
  const serviceId = str(formData, "serviceId");
  const back = `/admin/content/services/${encodeURIComponent(serviceId)}`;
  const options = str(formData, "options").split("\n").map((o) => o.trim()).filter(Boolean);
  const parsed = serviceFieldSchema.safeParse({
    serviceId,
    fieldKey: str(formData, "fieldKey"),
    label: str(formData, "label"),
    type: str(formData, "type") || "text",
    options,
    placeholder: str(formData, "placeholder"),
    helpText: str(formData, "helpText"),
    required: bool(formData, "required"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) redirect(flashPath(back, parsed.error.issues[0]?.message || "فیلد نامعتبر است.", "err"));
  const d = parsed.data;
  if ((d.type === "select" || d.type === "radio") && (!d.options || d.options.length === 0)) {
    redirect(flashPath(back, "برای فیلد انتخابی، حداقل یک گزینه وارد کنید.", "err"));
  }
  const dup = await get("SELECT id FROM service_fields WHERE service_id = ? AND field_key = ?", [serviceId, d.fieldKey]);
  if (dup) redirect(flashPath(back, "کلید این فیلد در این خدمت تکراری است.", "err"));
  await run(
    `INSERT INTO service_fields (id, service_id, field_key, label, type, options_json, placeholder, help_text, required, sort_order, active)
     VALUES (?,?,?,?,?,?,?,?,?,?,1)`,
    [newId(), serviceId, d.fieldKey, d.label, d.type, JSON.stringify(d.options || []), d.placeholder || "", d.helpText || "", d.required ? 1 : 0, d.sortOrder ?? 99],
  );
  await logAudit(actor(user), "service_field.added", { type: "service", id: serviceId }, { field: d.fieldKey });
  redirect(flashPath(back, "فیلد اضافه شد."));
}

export async function toggleServiceFieldAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.services");
  const id = str(formData, "id");
  const serviceId = str(formData, "serviceId");
  await run("UPDATE service_fields SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id]);
  await logAudit(actor(user), "service_field.toggled", { type: "service", id: serviceId }, { field: id });
  redirect(flashPath(`/admin/content/services/${encodeURIComponent(serviceId)}`, "وضعیت فیلد تغییر کرد."));
}

export async function deleteServiceFieldAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.services");
  const id = str(formData, "id");
  const serviceId = str(formData, "serviceId");
  await run("DELETE FROM service_fields WHERE id = ?", [id]);
  await logAudit(actor(user), "service_field.deleted", { type: "service", id: serviceId }, { field: id });
  redirect(flashPath(`/admin/content/services/${encodeURIComponent(serviceId)}`, "فیلد حذف شد. درخواست‌های قبلی تغییری نمی‌کنند."));
}

/* ------------------------------ سؤالات ------------------------------ */

export async function saveFaqAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.faqs");
  const id = str(formData, "id");
  const parsed = faqSchema.safeParse({
    id: id || undefined,
    question: str(formData, "question"),
    answer: str(formData, "answer"),
    serviceSlug: str(formData, "serviceSlug"),
    sortOrder: formData.get("sortOrder") ?? 0,
    published: bool(formData, "published"),
  });
  if (!parsed.success) redirect(flashPath("/admin/content/faqs", parsed.error.issues[0]?.message || "سؤال یا پاسخ نامعتبر است.", "err"));
  const d = parsed.data;
  let serviceId: string | null = null;
  if (d.serviceSlug) {
    const svc = await get<{ id: string }>("SELECT id FROM services WHERE slug = ?", [d.serviceSlug]);
    if (!svc) redirect(flashPath("/admin/content/faqs", "خدمت انتخاب‌شده معتبر نیست.", "err"));
    serviceId = svc.id;
  }
  if (id) {
    await run("UPDATE faqs SET service_id=?, question=?, answer_md=?, sort_order=?, published=?, updated_at=? WHERE id=?", [
      serviceId, d.question, d.answer, d.sortOrder ?? 0, d.published ? 1 : 0, nowIso(), id,
    ]);
  } else {
    await run("INSERT INTO faqs (id, service_id, question, answer_md, sort_order, published, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [
      newId(), serviceId, d.question, d.answer, d.sortOrder ?? 99, d.published ? 1 : 0, nowIso(), nowIso(),
    ]);
  }
  await logAudit(actor(user), id ? "faq.updated" : "faq.created", { type: "faq", id: id || "" });
  redirect(flashPath("/admin/content/faqs", "سؤال ذخیره شد."));
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.faqs");
  const id = str(formData, "id");
  await run("DELETE FROM faqs WHERE id = ?", [id]);
  await logAudit(actor(user), "faq.deleted", { type: "faq", id });
  redirect(flashPath("/admin/content/faqs", "سؤال حذف شد."));
}

/* ------------------------------ مقالات ------------------------------ */

export async function saveArticleAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.articles");
  const id = str(formData, "id");
  const related = formData.getAll("relatedServices").map(String);
  const slugInput = slugify(str(formData, "slug")) || slugify(str(formData, "title"));
  const parsed = articleSchema.safeParse({
    id: id || undefined,
    slug: slugInput,
    title: str(formData, "title"),
    excerpt: str(formData, "excerpt"),
    body: str(formData, "body"),
    author: str(formData, "author"),
    category: str(formData, "category"),
    status: str(formData, "status") === "published" ? "published" : "draft",
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    relatedServices: related,
    reviewNote: str(formData, "reviewNote"),
  });
  const back = id ? `/admin/content/articles/${encodeURIComponent(id)}` : "/admin/content/articles/new";
  if (!parsed.success) redirect(flashPath(back, parsed.error.issues[0]?.message || "اطلاعات مقاله نامعتبر است.", "err"));
  const d = parsed.data;
  if (!/^[a-z0-9\u0600-\u06FF-]+$/.test(d.slug) || d.slug.length < 3) redirect(flashPath(back, "نامک (slug) فقط می‌تواند شامل حروف لاتین کوچک، عدد و خط تیره باشد.", "err"));

  const clash = await get<{ id: string }>("SELECT id FROM articles WHERE slug = ?", [d.slug]);
  if (clash && clash.id !== id) redirect(flashPath(back, "این نامک قبلاً استفاده شده است.", "err"));

  const existing = id ? await get<{ published_at: string | null }>("SELECT published_at FROM articles WHERE id = ?", [id]) : undefined;
  const publishedAt = d.status === "published" ? existing?.published_at || nowIso() : null;
  const relatedJson = JSON.stringify((d.relatedServices || []).slice(0, 10));

  if (id) {
    await run(
      `UPDATE articles SET slug=?, title=?, excerpt=?, body_md=?, author=?, category=?, status=?, related_services=?,
         seo_title=?, seo_description=?, review_note=?, published_at=?, updated_at=? WHERE id=?`,
      [d.slug, d.title, d.excerpt || "", d.body, d.author || "", d.category || "", d.status, relatedJson,
        d.seoTitle || "", d.seoDescription || "", d.reviewNote || "", publishedAt, nowIso(), id],
    );
  } else {
    const newArticleId = newId();
    await run(
      `INSERT INTO articles (id, slug, title, excerpt, body_md, cover_path, author, category, status, related_services,
         seo_title, seo_description, review_note, published_at, updated_at, created_at)
       VALUES (?,?,?,?,?,'',?,?,?,?,?,?,?,?,?,?)`,
      [newArticleId, d.slug, d.title, d.excerpt || "", d.body, d.author || "", d.category || "", d.status, relatedJson,
        d.seoTitle || "", d.seoDescription || "", d.reviewNote || "", publishedAt, nowIso(), nowIso()],
    );
    await logAudit(actor(user), "article.created", { type: "article", id: newArticleId });
    redirect(flashPath(`/admin/content/articles/${newArticleId}`, "مقاله ایجاد شد."));
  }
  await logAudit(actor(user), "article.updated", { type: "article", id });
  redirect(flashPath(`/admin/content/articles/${id}`, d.status === "published" ? "مقاله منتشر شد." : "پیش‌نویس ذخیره شد."));
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.articles");
  const id = str(formData, "id");
  await run("DELETE FROM articles WHERE id = ?", [id]);
  await logAudit(actor(user), "article.deleted", { type: "article", id });
  redirect(flashPath("/admin/content/articles", "مقاله حذف شد."));
}

/* ----------------------------- اطلاعیه‌ها ----------------------------- */

export async function saveAnnouncementAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.announcements");
  const id = str(formData, "id");
  const parsed = announcementSchema.safeParse({
    id: id || undefined,
    title: str(formData, "title"),
    body: str(formData, "body"),
    kind: str(formData, "kind") || "info",
    active: bool(formData, "active"),
    startsAt: str(formData, "startsAt"),
    endsAt: str(formData, "endsAt"),
  });
  if (!parsed.success) redirect(flashPath("/admin/content/announcements", parsed.error.issues[0]?.message || "اطلاعیه نامعتبر است.", "err"));
  const d = parsed.data;
  const toIso = (v?: string) => (v ? new Date(v).toISOString() : null);
  if (id) {
    await run("UPDATE announcements SET title=?, body_md=?, kind=?, active=?, starts_at=?, ends_at=?, updated_at=? WHERE id=?", [
      d.title, d.body || "", d.kind || "info", d.active ? 1 : 0, toIso(d.startsAt), toIso(d.endsAt), nowIso(), id,
    ]);
  } else {
    await run("INSERT INTO announcements (id, title, body_md, kind, active, starts_at, ends_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)", [
      newId(), d.title, d.body || "", d.kind || "info", d.active ? 1 : 0, toIso(d.startsAt), toIso(d.endsAt), nowIso(), nowIso(),
    ]);
  }
  await logAudit(actor(user), "announcement.saved", { type: "announcement", id: id || "" });
  redirect(flashPath("/admin/content/announcements", "اطلاعیه ذخیره شد."));
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.announcements");
  const id = str(formData, "id");
  await run("DELETE FROM announcements WHERE id = ?", [id]);
  await logAudit(actor(user), "announcement.deleted", { type: "announcement", id });
  redirect(flashPath("/admin/content/announcements", "اطلاعیه حذف شد."));
}

/* ------------------------------ تنظیمات ------------------------------ */

/** ذخیره یک گروه تنظیمات؛ فقط کلیدهای whitelist و با اعتبارسنجی */
export async function saveSettingsAction(formData: FormData): Promise<void> {
  await ensureBootstrap();
  const user = await requirePermission("content.settings");
  const groupId = str(formData, "group");
  const back = `/admin/content/settings#${groupId}`;
  const entries: Record<string, string> = {};
  for (const key of ALLOWED_SETTING_KEYS) {
    if (!key.startsWith(groupId + ".")) continue;
    if (!formData.has(key)) continue;
    const field = fieldByKey(key);
    if (!field) continue;
    const res = validateSettingValue(field, str(formData, key));
    if (!res.ok) redirect(flashPath(back, res.error, "err"));
    entries[key] = res.value;
  }
  if (Object.keys(entries).length === 0) redirect(flashPath(back, "فیلدی برای ذخیره وجود ندارد.", "err"));
  await setSettings(entries);
  invalidateSettingsCache();
  await logAudit(actor(user), "settings.updated", { type: "settings", id: groupId }, { keys: Object.keys(entries) });
  redirect(flashPath(back, "تنظیمات ذخیره شد و در سراسر سایت اعمال شد."));
}
