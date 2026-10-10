/**
 * داده‌های ایستا (Static Data)
 * ---------------------------------------------------------------
 * این فایل داده‌های مورد نیاز صفحات عمومی را در حالت
 * STATIC EXPORT (GitHub Pages) بدون نیاز به پایگاه داده فراهم می‌کند.
 *
 * داده‌ها دقیقاً برابر با داده‌های seed اولیه هستند؛ به‌جای SQLite،
 * مستقیماً از حافظه بارگذاری می‌شوند. هر گونه تغییر در seed اصلی
 * (src/lib/db/seed.ts) باید در اینجا هم اعمال شود.
 *
 * صفحاتی که ذاتاً داینامیک هستند (admin، ثبت درخواست، پیگیری، QR API)
 * در حالت static با پیام «نیازمند سرور» نمایش داده می‌شوند.
 */
import { SERVICES_SEED, FIELDS_SEED, FAQS_SEED, ARTICLES_SEED } from "./db/seed";
import { ARTICLE_PACK } from "./db/articles-content";
import { HOURS_DEFAULT_JSON, OFFICE_EMAIL_DEFAULT, SITE_URL_DEFAULT, SETTING_DEFAULTS } from "./settings";
import { newId } from "./utils";

/** تنظیمات پیش‌فرض سایت برای حالت static */
export const STATIC_SETTINGS: Record<string, string> = { ...SETTING_DEFAULTS };

/** بررسی اینکه آیا در حالت static export هستیم یا نه */
export const IS_STATIC = process.env.STATIC_EXPORT === "true";

/* ---------------------------------------------------------------- *
 * سرویس‌ها (Services)
 * ---------------------------------------------------------------- */

export interface StaticService {
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

function makeServices(): StaticService[] {
  const now = "2025-01-01T00:00:00.000Z";
  return SERVICES_SEED.map((s, idx) => ({
    id: `static-svc-${idx + 1}`,
    slug: s.slug,
    title: s.title,
    tagline: s.tagline,
    summary: s.summary,
    intro_md: s.intro_md,
    audience_md: s.audience_md,
    process_md: s.process_md,
    documents_md: s.documents_md,
    seo_title: s.seo_title,
    seo_description: s.seo_description,
    icon: s.icon,
    featured: Boolean(s.featured),
    active: true,
    sort_order: s.sort_order,
    allow_attachments: true,
    max_attachments: s.max_attachments,
    reviewed_at: null,
    updated_at: now,
  }));
}

const SERVICES = makeServices();
const SERVICE_BY_SLUG = new Map(SERVICES.map((s) => [s.slug, s]));

export function staticGetActiveServices(): StaticService[] {
  return [...SERVICES].sort(
    (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title, "fa"),
  );
}

export function staticGetServiceBySlug(slug: string): StaticService | null {
  return SERVICE_BY_SLUG.get(slug) || null;
}

export function staticGetFeaturedServices(): StaticService[] {
  return staticGetActiveServices().filter((s) => s.featured).slice(0, 4);
}

/* ---------------------------------------------------------------- *
 * فیلدهای فرم هر خدمت (Service Fields)
 * ---------------------------------------------------------------- */

export interface StaticField {
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

const FIELDS: StaticField[] = (() => {
  const out: StaticField[] = [];
  let counter = 0;
  for (const f of FIELDS_SEED) {
    const service = SERVICES.find((s) => s.slug === f.service);
    if (!service) continue;
    out.push({
      id: `static-fld-${++counter}`,
      service_id: service.id,
      field_key: f.field_key,
      label: f.label,
      type: f.type,
      options: f.options || [],
      placeholder: f.placeholder || "",
      help_text: f.help_text || "",
      required: Boolean(f.required),
      sort_order: counter,
      active: true,
    });
  }
  return out;
})();

export function staticGetServiceFields(serviceId: string): StaticField[] {
  return FIELDS.filter((f) => f.service_id === serviceId).sort((a, b) => a.sort_order - b.sort_order);
}

/* ---------------------------------------------------------------- *
 * سؤالات متداول (FAQs)
 * ---------------------------------------------------------------- */

export interface StaticFaq {
  id: string;
  service_slug: string | null;
  question: string;
  answer_md: string;
  sort_order: number;
  published: boolean;
  updated_at: string;
}

const FAQS: StaticFaq[] = FAQS_SEED.map((f, idx) => ({
  id: `static-faq-${idx + 1}`,
  service_slug: f.service || null,
  question: f.question,
  answer_md: f.answer,
  sort_order: idx + 1,
  published: true,
  updated_at: "2025-01-01T00:00:00.000Z",
}));

export function staticGetPublishedFaqs(serviceSlug?: string): StaticFaq[] {
  if (serviceSlug) {
    return FAQS.filter((f) => !f.service_slug || f.service_slug === serviceSlug);
  }
  return [...FAQS];
}

/* ---------------------------------------------------------------- *
 * مقالات (Articles)
 * ---------------------------------------------------------------- */

export interface StaticArticle {
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

const ARTICLES: StaticArticle[] = [
  ...ARTICLES_SEED.map((a, idx) => ({
    id: `static-art-${idx + 1}`,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body_md: a.body,
    cover_path: "",
    author: "دفتر خدمات سلامت ۴۷۷",
    category: a.category,
    status: a.status,
    related_services: a.related,
    seo_title: a.seo_title,
    seo_description: a.seo_description,
    review_note: a.review_note || "",
    published_at: a.status === "published" ? "2025-01-01T00:00:00.000Z" : null,
    updated_at: "2025-01-01T00:00:00.000Z",
  })),
  ...ARTICLE_PACK.map((a, idx) => ({
    id: `static-artpack-${idx + 1}`,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body_md: a.body,
    cover_path: `/images/articles/${a.cover}`,
    author: "تیم محتوای دفتر خدمات سلامت ۴۷۷",
    category: a.category,
    status: "published" as const,
    related_services: a.related,
    seo_title: a.seo_title,
    seo_description: a.seo_description,
    review_note: "مطلب آموزشی است. الزامات و مدارک نهایی هر خدمت پیش از اعلام رسمی توسط دفتر بازبینی می‌شود.",
    published_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  })),
];

export function staticGetPublishedArticles(category?: string, q?: string): StaticArticle[] {
  let list = ARTICLES.filter((a) => a.status === "published");
  if (category) list = list.filter((a) => a.category === category);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.excerpt.toLowerCase().includes(needle) ||
        a.body_md.toLowerCase().includes(needle),
    );
  }
  return list.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
}

export function staticGetArticleBySlug(slug: string): StaticArticle | null {
  return ARTICLES.find((a) => a.slug === slug) || null;
}

export function staticGetArticleCategories(): string[] {
  return Array.from(
    new Set(ARTICLES.filter((a) => a.status === "published" && a.category).map((a) => a.category)),
  ).sort((a, b) => a.localeCompare(b, "fa"));
}

/* ---------------------------------------------------------------- *
 * Site config (PublicSiteConfig)
 * ---------------------------------------------------------------- */

export interface PublicSiteConfig {
  name: string;
  shortName: string;
  slogan: string;
  description: string;
  city: string;
  province: string;
  address: string;
  addressFull: string;
  lat: number;
  lng: number;
  mapUrl: string;
  mapProfileUrl: string;
  phone1: string;
  phone2: string;
  hours: Array<{ day: string; hours: string; closed: boolean }>;
  social: Array<{ label: string; url: string }>;
  publicEmail: string;
  siteUrl: string;
  homeTitle: string;
  homeDescription: string;
  dataDisclaimer: string;
  footerNote: string;
  retentionDays: string;
  privacyMd: string;
  termsMd: string;
  aboutMd: string;
}

export function staticGetSiteConfig(): PublicSiteConfig {
  const s = STATIC_SETTINGS;
  const phone1 = s["business.phone_1"] || "";
  const phone2 = s["business.phone_2"] || "";
  const lat = Number(s["business.lat"] || "0");
  const lng = Number(s["business.lng"] || "0");
  const siteUrl = s["seo.site_url"] || SITE_URL_DEFAULT;

  let hours: Array<{ day: string; hours: string; closed: boolean }> = [];
  try {
    hours = JSON.parse(s["business.hours_json"] || "[]");
  } catch {
    hours = [];
  }
  let social: Array<{ label: string; url: string }> = [];
  try {
    social = JSON.parse(s["business.social_json"] || "[]");
  } catch {
    social = [];
  }

  return {
    name: s["site.name"] || "",
    shortName: s["site.short_name"] || "",
    slogan: s["site.slogan"] || "",
    description: s["site.description"] || "",
    city: s["site.city"] || "",
    province: s["site.province"] || "",
    address: s["business.address"] || "",
    addressFull: s["business.address_full"] || "",
    lat,
    lng,
    mapUrl: s["business.map_url"] || `https://www.google.com/maps?q=${lat},${lng}`,
    mapProfileUrl: s["business.map_profile_url"] || "",
    phone1,
    phone2,
    hours,
    social,
    publicEmail: s["PUBLIC_CONTACT_EMAIL"] || OFFICE_EMAIL_DEFAULT,
    siteUrl,
    homeTitle: s["seo.home_title"] || "",
    homeDescription: s["seo.home_description"] || "",
    dataDisclaimer: s["policy.data_disclaimer"] || "",
    footerNote: s["content.footer_note"] || "",
    retentionDays: s["policy.retention_days"] || "",
    privacyMd: s["policy.privacy_md"] || "",
    termsMd: s["policy.terms_md"] || "",
    aboutMd: s["content.about_md"] || "",
  };
}
