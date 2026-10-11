/**
 * اعتبارسنجی و مهاجرت وضعیت ذخیره‌شده در مرورگر
 * ---------------------------------------------------------------
 * داده‌های localStorage ممکن است از نسخه‌های قدیمی‌تر یا دست‌کاری‌شده
 * باشند؛ این ماژول ساختار را با نسخه فعلی هم‌سان می‌کند تا برنامه
 * هرگز با خطای «فیلد ناموجود» متوقف نشود.
 */
import { buildSeed } from "./seed";
import type { AppState, RequestRecord, ServiceRecord, UserRecord } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function sanitizeState(input: unknown): AppState | null {
  if (!isObject(input)) return null;
  const fresh = buildSeed(new Date());
  const state = input as Partial<AppState>;
  if (!Array.isArray(state.requests) || !Array.isArray(state.services)) return null;

  const services: ServiceRecord[] = asArray<ServiceRecord>(state.services).map((service) => {
    const fallback = fresh.services.find((s) => s.slug === service.slug);
    return {
      ...(fallback ?? fresh.services[0]),
      ...service,
      fields: Array.isArray(service.fields) && service.fields.length ? service.fields : fallback?.fields ?? [],
      highlights: asArray<string>(service.highlights),
      deliverables: asArray<string>(service.deliverables),
      tags: asArray<string>(service.tags),
    };
  });

  const requests: RequestRecord[] = asArray<RequestRecord>(state.requests).map((request) => ({
    ...request,
    answers: asArray(request.answers),
    attachments: asArray(request.attachments),
    timeline: asArray(request.timeline),
    notes: asArray(request.notes),
    tags: asArray(request.tags),
    priority: request.priority ?? "normal",
    source: request.source ?? "web",
  }));

  const users: UserRecord[] = asArray<UserRecord>(state.users);

  return {
    version: 1,
    requests,
    services,
    faqs: asArray(state.faqs),
    articles: asArray(state.articles),
    users: users.length ? users : fresh.users,
    notifications: asArray(state.notifications),
    audit: asArray(state.audit),
    announcements: asArray(state.announcements),
    settings: { ...fresh.settings, ...(isObject(state.settings) ? state.settings : {}) },
    session: state.session && users.some((u) => u.id === state.session?.userId) ? state.session : null,
    myRequests: asArray<string>(state.myRequests),
    hydratedAt: typeof state.hydratedAt === "string" ? state.hydratedAt : null,
  };
}
