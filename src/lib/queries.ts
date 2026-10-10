/** توابع دسترسی به داده‌های محتوایی و درخواست‌ها */
import { all, get, run, nowIso, asBool, asJson } from "@/lib/db";
import { newId } from "@/lib/utils";
import { REQUEST_STATUS_KEYS, type RequestStatus } from "@/lib/constants";
import {
  IS_STATIC,
  staticGetActiveServices,
  staticGetServiceBySlug,
  staticGetServiceFields,
  staticGetPublishedFaqs,
  staticGetPublishedArticles,
  staticGetArticleBySlug,
  staticGetArticleCategories,
  type StaticService,
  type StaticField,
  type StaticFaq,
  type StaticArticle,
} from "@/lib/static-data";

/* -------------------------------------------------------------------------- *
 * حالت Static Export
 * --------------------------------------------------------------------------
 * در حالت static (GitHub Pages) تمام توابع فقط‌خواندنی عمومی مستقیماً از
 * داده‌های seed داخل حافظه پاسخ می‌دهند و به پایگاه داده متصل نمی‌شوند.
 * توابع نوشتنی فقط در حالت عادی در دسترس هستند؛ صفحاتی که به آن‌ها وابسته‌اند
 * در حالت static با پیام «نیازمند سرور» نمایش داده می‌شوند.
 * -------------------------------------------------------------------------- */

/* ------------------------------ خدمات ------------------------------ */

export interface Service {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  intro_md: string;
  audience_md: string;
  process_md: string;
  documents_md: string;
  seo_title: string;
  seo_description: string;
  icon: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  allow_attachments: boolean;
  max_attachments: number;
  reviewed_at: string | null;
  updated_at: string;
}

const SERVICE_SELECT = `SELECT id, slug, title, tagline, summary, intro_md, audience_md, process_md, documents_md,
  seo_title, seo_description, icon, featured, active, sort_order, allow_attachments, max_attachments, reviewed_at, updated_at
  FROM services`;

function mapService(row: Record<string, unknown>): Service {
  return {
    ...(row as unknown as Service),
    featured: asBool(row.featured),
    active: asBool(row.active),
    allow_attachments: asBool(row.allow_attachments),
    sort_order: Number(row.sort_order || 0),
    max_attachments: Number(row.max_attachments || 4),
    reviewed_at: (row.reviewed_at as string) ?? null,
  };
}

export async function getActiveServices(): Promise<Service[]> {
  if (IS_STATIC) return staticGetActiveServices() as unknown as Service[];
  const rows = await all(`${SERVICE_SELECT} WHERE active = 1 ORDER BY sort_order ASC, title ASC`);
  return rows.map(mapService);
}

export async function getFeaturedServices(): Promise<Service[]> {
  const rows = await all(`${SERVICE_SELECT} WHERE active = 1 AND featured = 1 ORDER BY sort_order ASC`);
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (IS_STATIC) return staticGetServiceBySlug(slug) as unknown as Service | null;
  const row = await get(`${SERVICE_SELECT} WHERE slug = ? AND active = 1`, [slug]);
  return row ? mapService(row) : null;
}

export async function getAllServicesForAdmin(): Promise<Service[]> {
  const rows = await all(`${SERVICE_SELECT} ORDER BY sort_order ASC, title ASC`);
  return rows.map(mapService);
}

export async function getServiceById(id: string): Promise<Service | null> {
  const row = await get(`${SERVICE_SELECT} WHERE id = ?`, [id]);
  return row ? mapService(row) : null;
}

export interface ServiceField {
  id: string;
  service_id: string;
  field_key: string;
  label: string;
  type: string;
  options: string[];
  placeholder: string;
  help_text: string;
  required: boolean;
  sort_order: number;
  active: boolean;
}

export async function getServiceFields(serviceId: string): Promise<ServiceField[]> {
  if (IS_STATIC) return staticGetServiceFields(serviceId) as unknown as ServiceField[];
  const rows = await all(
    "SELECT * FROM service_fields WHERE service_id = ? AND active = 1 ORDER BY sort_order ASC",
    [serviceId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    service_id: String(r.service_id),
    field_key: String(r.field_key),
    label: String(r.label),
    type: String(r.type),
    options: asJson<string[]>(r.options_json, []),
    placeholder: String(r.placeholder || ""),
    help_text: String(r.help_text || ""),
    required: asBool(r.required),
    sort_order: Number(r.sort_order || 0),
    active: asBool(r.active),
  }));
}

/* ------------------------------ سؤالات ------------------------------ */

export interface Faq {
  id: string;
  service_slug: string | null;
  question: string;
  answer_md: string;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

export async function getPublishedFaqs(serviceSlug?: string): Promise<Faq[]> {
  if (IS_STATIC) return staticGetPublishedFaqs(serviceSlug) as unknown as Faq[];
  if (serviceSlug) {
    const rows = await all(
      `SELECT f.id, s.slug AS service_slug, f.question, f.answer_md, f.sort_order, f.published, f.updated_at
         FROM faqs f LEFT JOIN services s ON s.id = f.service_id
        WHERE f.published = 1 AND (f.service_id IS NULL OR s.slug = ?)
        ORDER BY f.sort_order ASC`,
      [serviceSlug],
    );
    return rows as unknown as Faq[];
  }
  const rows = await all(
    `SELECT f.id, s.slug AS service_slug, f.question, f.answer_md, f.sort_order, f.published, f.updated_at
       FROM faqs f LEFT JOIN services s ON s.id = f.service_id
      WHERE f.published = 1 ORDER BY f.sort_order ASC`,
  );
  return rows as unknown as Faq[];
}

export async function getFaqsForAdmin(): Promise<Faq[]> {
  const rows = await all(
    `SELECT f.id, s.slug AS service_slug, f.question, f.answer_md, f.sort_order, f.published, f.updated_at
       FROM faqs f LEFT JOIN services s ON s.id = f.service_id
      ORDER BY f.sort_order ASC`,
  );
  return (rows as unknown as Faq[]).map((f) => ({ ...f, published: asBool(f.published) }));
}

/* ------------------------------ مقالات ------------------------------ */

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  cover_path: string;
  author: string;
  category: string;
  status: "draft" | "published";
  related_services: string[];
  seo_title: string;
  seo_description: string;
  review_note: string;
  published_at: string | null;
  updated_at: string;
}

const ARTICLE_SELECT = `SELECT id, slug, title, excerpt, body_md, cover_path, author, category, status,
  related_services, seo_title, seo_description, review_note, published_at, updated_at FROM articles`;

function mapArticle(row: Record<string, unknown>): Article {
  return {
    ...(row as unknown as Article),
    related_services: asJson<string[]>(row.related_services, []),
    status: (row.status as "draft" | "published") || "draft",
    published_at: (row.published_at as string) ?? null,
  };
}

export async function getPublishedArticles(category?: string, q?: string): Promise<Article[]> {
  if (IS_STATIC) return staticGetPublishedArticles(category, q) as unknown as Article[];
  const where: string[] = ["status = 'published'"];
  const params: unknown[] = [];
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  if (q) {
    where.push("(LOWER(title) LIKE LOWER(?) OR LOWER(excerpt) LIKE LOWER(?) OR LOWER(body_md) LIKE LOWER(?))");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const rows = await all(`${ARTICLE_SELECT} WHERE ${where.join(" AND ")} ORDER BY published_at DESC`, params as never);
  return rows.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (IS_STATIC) return staticGetArticleBySlug(slug) as unknown as Article | null;
  const row = await get(`${ARTICLE_SELECT} WHERE slug = ?`, [slug]);
  return row ? mapArticle(row) : null;
}

export async function getArticlesForAdmin(): Promise<Article[]> {
  const rows = await all(`${ARTICLE_SELECT} ORDER BY updated_at DESC`);
  return rows.map(mapArticle);
}

export async function getArticleCategories(): Promise<string[]> {
  if (IS_STATIC) return staticGetArticleCategories();
  const rows = await all<{ category: string }>(
    "SELECT DISTINCT category FROM articles WHERE status = 'published' AND category <> '' ORDER BY category ASC",
  );
  return rows.map((r) => r.category);
}

/* ---------------------------- اطلاعیه‌ها ---------------------------- */

export interface Announcement {
  id: string;
  title: string;
  body_md: string;
  kind: string;
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  if (IS_STATIC) return [];
  const now = nowIso();
  const rows = await all(
    `SELECT id, title, body_md, kind FROM announcements
      WHERE active = 1 AND (starts_at IS NULL OR starts_at <= ?) AND (ends_at IS NULL OR ends_at >= ?)
      ORDER BY created_at DESC LIMIT 3`,
    [now, now],
  );
  return rows as unknown as Announcement[];
}

/* ----------------------------- درخواست‌ها ----------------------------- */

export interface RequestRow {
  id: string;
  tracking_code: string;
  client_submission_id: string | null;
  service_id: string | null;
  service_slug: string;
  service_title: string;
  requester_type: string;
  full_name: string;
  phone: string;
  phone_last4: string;
  email: string;
  city: string;
  org_name: string;
  preferred_contact: string;
  message: string;
  status: RequestStatus;
  public_note: string;
  internal_note: string;
  consent_privacy_at: string | null;
  consent_marketing: boolean;
  source: string;
  notification_state: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

function mapRequest(row: Record<string, unknown>): RequestRow {
  return {
    ...(row as unknown as RequestRow),
    consent_marketing: asBool(row.consent_marketing),
    archived: asBool(row.archived),
    status: (row.status as RequestStatus) || "new",
  };
}

export interface RequestFilters {
  status?: string;
  serviceSlug?: string;
  q?: string;
  from?: string;
  to?: string;
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export async function listRequests(filters: RequestFilters = {}): Promise<{ rows: RequestRow[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (!filters.archived) where.push("archived = 0");
  if (filters.status && filters.status !== "all") {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.serviceSlug && filters.serviceSlug !== "all") {
    where.push("service_slug = ?");
    params.push(filters.serviceSlug);
  }
  if (filters.q) {
    where.push("(LOWER(tracking_code) LIKE LOWER(?) OR LOWER(full_name) LIKE LOWER(?) OR phone LIKE ? OR LOWER(org_name) LIKE LOWER(?))");
    const q = `%${filters.q}%`;
    params.push(q, q, q, q);
  }
  if (filters.from) {
    where.push("created_at >= ?");
    params.push(new Date(filters.from).toISOString());
  }
  if (filters.to) {
    where.push("created_at <= ?");
    params.push(new Date(`${filters.to}T23:59:59.999Z`).toISOString());
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const totalRow = await get<{ c: number }>(`SELECT COUNT(*) AS c FROM requests ${clause}`, params as never);
  const limit = Math.min(Math.max(Number(filters.limit || 25), 1), 200);
  const offset = Math.max(Number(filters.offset || 0), 0);
  const rows = await all(
    `SELECT * FROM requests ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset] as never,
  );
  return { rows: rows.map(mapRequest), total: Number(totalRow?.c || 0) };
}

export async function getRequestById(id: string): Promise<RequestRow | null> {
  const row = await get("SELECT * FROM requests WHERE id = ?", [id]);
  return row ? mapRequest(row) : null;
}

export async function getRequestByTrackingCode(code: string): Promise<RequestRow | null> {
  const row = await get("SELECT * FROM requests WHERE tracking_code = ?", [code.toUpperCase()]);
  return row ? mapRequest(row) : null;
}

export interface RequestFieldRow {
  field_key: string;
  label: string;
  value: string;
}

export async function getRequestFields(requestId: string): Promise<RequestFieldRow[]> {
  return all<RequestFieldRow>("SELECT field_key, label, value FROM request_fields WHERE request_id = ? ORDER BY sort_order ASC", [requestId]);
}

export async function getRequestAttachments(requestId: string): Promise<
  Array<{ id: string; original_name: string; stored_name: string; mime_type: string; size_bytes: number; uploaded_at: string; deleted_at: string | null }>
> {
  return all(
    "SELECT id, original_name, stored_name, mime_type, size_bytes, uploaded_at, deleted_at FROM attachments WHERE request_id = ? ORDER BY uploaded_at ASC",
    [requestId],
  );
}

export async function getRequestHistory(requestId: string): Promise<
  Array<{ id: string; from_status: string; to_status: string; note: string; actor_name: string; created_at: string }>
> {
  return all(
    "SELECT id, from_status, to_status, note, actor_name, created_at FROM request_status_history WHERE request_id = ? ORDER BY created_at ASC",
    [requestId],
  );
}

export async function dashboardStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byService: Array<{ slug: string; title: string; count: number }>;
  last7Days: number;
  today: number;
}> {
  const byStatus: Record<string, number> = {};
  for (const key of REQUEST_STATUS_KEYS) byStatus[key] = 0;
  const statusRows = await all<{ status: string; c: number }>(
    "SELECT status, COUNT(*) AS c FROM requests WHERE archived = 0 GROUP BY status",
  );
  for (const r of statusRows) byStatus[r.status] = Number(r.c);

  const serviceRows = await all<{ slug: string; title: string; count: number }>(
    "SELECT service_slug AS slug, service_title AS title, COUNT(*) AS count FROM requests WHERE archived = 0 GROUP BY service_slug, service_title ORDER BY count DESC",
  );

  const totalRow = await get<{ c: number }>("SELECT COUNT(*) AS c FROM requests WHERE archived = 0");
  const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const last7 = await get<{ c: number }>("SELECT COUNT(*) AS c FROM requests WHERE archived = 0 AND created_at >= ?", [since7]);
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const today = await get<{ c: number }>("SELECT COUNT(*) AS c FROM requests WHERE archived = 0 AND created_at >= ?", [startOfToday.toISOString()]);

  return {
    total: Number(totalRow?.c || 0),
    byStatus,
    byService: serviceRows.map((r) => ({ ...r, count: Number(r.count) })),
    last7Days: Number(last7?.c || 0),
    today: Number(today?.c || 0),
  };
}

/* ------------------------------ کاربران ------------------------------ */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export async function listUsers(): Promise<AdminUser[]> {
  const rows = await all(
    "SELECT id, name, email, role, active, must_change_password, last_login_at, created_at FROM users ORDER BY created_at ASC",
  );
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    role: String(r.role),
    active: asBool(r.active),
    must_change_password: asBool(r.must_change_password),
    last_login_at: (r.last_login_at as string) ?? null,
    created_at: String(r.created_at),
  }));
}

export async function createUser(input: { name: string; email: string; passwordHash: string; role: string }): Promise<string> {
  const id = newId();
  await run(
    `INSERT INTO users (id, name, email, password_hash, role, active, must_change_password, failed_attempts, created_at, updated_at)
     VALUES (?,?,?,?,?,1,1,0,?,?)`,
    [id, input.name, input.email.toLowerCase(), input.passwordHash, input.role, nowIso(), nowIso()],
  );
  return id;
}

/* ------------------------------ جست‌وجو ------------------------------ */

export async function searchContent(q: string): Promise<{
  services: Array<{ slug: string; title: string; summary: string }>;
  articles: Array<{ slug: string; title: string; excerpt: string }>;
  faqs: Array<{ id: string; question: string }>;
}> {
  if (IS_STATIC) {
    const needle = q.toLowerCase();
    const services = staticGetActiveServices()
      .filter((s) => s.title.toLowerCase().includes(needle) || s.summary.toLowerCase().includes(needle) || s.intro_md.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((s) => ({ slug: s.slug, title: s.title, summary: s.summary }));
    const articles = staticGetPublishedArticles()
      .filter((a) => a.title.toLowerCase().includes(needle) || a.excerpt.toLowerCase().includes(needle) || a.body_md.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt }));
    const faqs = staticGetPublishedFaqs()
      .filter((f) => f.question.toLowerCase().includes(needle) || f.answer_md.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((f) => ({ id: f.id, question: f.question }));
    return { services, articles, faqs };
  }
  const like = `%${q}%`;
  const services = await all<{ slug: string; title: string; summary: string }>(
    "SELECT slug, title, summary FROM services WHERE active = 1 AND (title LIKE ? OR summary LIKE ? OR intro_md LIKE ?) ORDER BY sort_order ASC LIMIT 8",
    [like, like, like],
  );
  const articles = await all<{ slug: string; title: string; excerpt: string }>(
    "SELECT slug, title, excerpt FROM articles WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR body_md LIKE ?) ORDER BY published_at DESC LIMIT 8",
    [like, like, like],
  );
  const faqs = await all<{ id: string; question: string }>(
    "SELECT id, question FROM faqs WHERE published = 1 AND (question LIKE ? OR answer_md LIKE ?) ORDER BY sort_order ASC LIMIT 8",
    [like, like],
  );
  return { services, articles, faqs };
}

/** تعداد درخواست‌های هر روز برای نمودار داشبورد (روزهای اخیر) */
export async function requestsPerDay(days = 14): Promise<Array<{ day: string; count: number }>> {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const rows = await all<{ day: string; c: number }>(
    "SELECT SUBSTR(created_at, 1, 10) AS day, COUNT(*) AS c FROM requests WHERE archived = 0 AND created_at >= ? GROUP BY SUBSTR(created_at, 1, 10) ORDER BY day ASC",
    [since],
  );
  return rows.map((r) => ({ day: String(r.day), count: Number(r.c) }));
}

export async function requestNotes(requestId: string): Promise<Array<{ id: string; author_name: string; body: string; created_at: string }>> {
  return all("SELECT id, author_name, body, created_at FROM request_notes WHERE request_id = ? ORDER BY created_at DESC", [requestId]);
}

export async function requestNotifications(requestId: string): Promise<Array<{ id: string; kind: string; channel: string; status: string; attempts: number; last_error: string; created_at: string; sent_at: string | null }>> {
  return all(
    "SELECT id, kind, channel, status, attempts, last_error, created_at, sent_at FROM notifications WHERE request_id = ? ORDER BY created_at ASC",
    [requestId],
  );
}

export async function getAttachment(id: string): Promise<{
  id: string; request_id: string; original_name: string; stored_name: string; mime_type: string; size_bytes: number; deleted_at: string | null;
} | undefined> {
  return get("SELECT id, request_id, original_name, stored_name, mime_type, size_bytes, deleted_at FROM attachments WHERE id = ?", [id]) as never;
}
