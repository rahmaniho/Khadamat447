/**
 * لایه محتوای عمومی (Content API)
 * ---------------------------------------------------------------
 * صفحات عمومی این ماژول را روی سرور می‌خوانند تا خروجی HTML کاملاً
 * ایندکس‌پذیر و سریع باشد؛ پیشخوان مدیریت از نسخه زنده (فروشگاه مرورگر)
 * استفاده می‌کند.
 */
import { SERVICES_SEED, FIELDS_SEED, FAQS_SEED, ARTICLES_SEED } from "./catalog";
import { ARTICLE_PACK } from "./knowledge";
import { SERVICE_UI } from "./site";
import { readingTime, stripMarkdown, normalizeFa } from "@/lib/format";

/* ------------------------------------------------------------------ *
 * خدمات
 * ------------------------------------------------------------------ */

export interface ServiceFieldView {
  id: string;
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  help?: string;
  required: boolean;
}

export interface ServiceView {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  intro: string;
  audience: string;
  process: string;
  documents: string;
  seoTitle: string;
  seoDescription: string;
  icon: string;
  emoji: string;
  gradient: string;
  accent: string;
  featured: boolean;
  popular: boolean;
  sortOrder: number;
  maxAttachments: number;
  duration: string;
  audienceLabel: string;
  highlights: string[];
  deliverables: string[];
  tags: string[];
  fields: ServiceFieldView[];
  documentsCount: number;
}

const KNOWN_TYPES = ["text", "number", "select", "textarea", "date", "tel", "email", "checkbox"];

export const SERVICES: ServiceView[] = SERVICES_SEED.map((s) => {
  const ui = SERVICE_UI[s.slug];
  const fields: ServiceFieldView[] = FIELDS_SEED.filter((f) => f.service === s.slug).map((f, i) => ({
    id: `${s.slug}-${i + 1}`,
    key: f.field_key,
    label: f.label,
    type: KNOWN_TYPES.includes(f.type) ? f.type : "text",
    options: f.options,
    placeholder: f.placeholder,
    help: f.help_text,
    required: Boolean(f.required),
  }));
  const docLines = s.documents_md
    .split("\n")
    .filter((line) => /^\s*[-•*]\s+/.test(line)).length;
  return {
    slug: s.slug,
    title: s.title,
    tagline: s.tagline,
    summary: s.summary,
    intro: s.intro_md,
    audience: s.audience_md,
    process: s.process_md,
    documents: s.documents_md,
    seoTitle: s.seo_title,
    seoDescription: s.seo_description,
    icon: ui?.icon ?? s.icon,
    emoji: ui?.emoji ?? "📄",
    gradient: ui?.gradient ?? "from-brand-500 to-brand-700",
    accent: ui?.accent ?? "text-brand-700 bg-brand-50",
    featured: Boolean(s.featured),
    popular: Boolean(ui?.popular),
    sortOrder: s.sort_order,
    maxAttachments: s.max_attachments,
    duration: ui?.duration ?? "—",
    audienceLabel: ui?.audience ?? "",
    highlights: ui?.highlights ?? [],
    deliverables: ui?.deliverables ?? [],
    tags: ui?.tags ?? [],
    fields,
    documentsCount: docLines,
  };
}).sort((a, b) => a.sortOrder - b.sortOrder);

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export function getService(slug: string): ServiceView | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getFeaturedServices(): ServiceView[] {
  const featured = SERVICES.filter((s) => s.featured);
  return featured.length ? featured.slice(0, 4) : SERVICES.slice(0, 4);
}

/* ------------------------------------------------------------------ *
 * پرسش‌های متداول
 * ------------------------------------------------------------------ */

export interface FaqView {
  id: string;
  question: string;
  answer: string;
  plainAnswer: string;
  category: string;
  serviceSlug: string | null;
}

const FAQ_CATEGORY: Record<string, string> = {
  "health-card": "کارت بهداشت",
  "health-training": "آموزش بهداشت اصناف",
  "health-qualification": "صلاحیت بهداشت",
  "audit-contracts": "ممیزی و قراردادها",
  other: "عمومی",
};

function guessCategory(serviceSlug: string | null, question: string): string {
  if (serviceSlug && FAQ_CATEGORY[serviceSlug]) return FAQ_CATEGORY[serviceSlug];
  if (/پیگیری|کد پیگیری/.test(question)) return "پیگیری درخواست";
  if (/خصوصی|اطلاعات|مدارک|کد ملی/.test(question)) return "حریم خصوصی";
  if (/زمان|هزینه|مدت/.test(question)) return "زمان و هزینه";
  return "عمومی";
}

export const FAQS: FaqView[] = FAQS_SEED.map((f, i) => ({
  id: `faq-${i + 1}`,
  question: f.question,
  answer: f.answer,
  plainAnswer: stripMarkdown(f.answer),
  category: guessCategory(f.service ?? null, f.question),
  serviceSlug: f.service ?? null,
}));

export const FAQ_CATEGORIES = Array.from(new Set(FAQS.map((f) => f.category)));

export function getFaqsForService(slug: string): FaqView[] {
  return FAQS.filter((f) => !f.serviceSlug || f.serviceSlug === slug);
}

/* ------------------------------------------------------------------ *
 * مقالات
 * ------------------------------------------------------------------ */

export interface ArticleView {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover: string;
  author: string;
  relatedServices: string[];
  readMinutes: number;
  publishedAt: string;
  updatedAt: string;
  wordCount: number;
  tags: string[];
}

const CATEGORY_FALLBACK_COVER: Record<string, string> = {
  "راهنمای استفاده": "/brand/og-default.jpg",
};

function toView(
  a: {
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    category: string;
    related: string[];
    seo_title?: string;
    seo_description?: string;
  },
  cover: string,
  author: string,
  id: string,
): ArticleView {
  const rt = readingTime(a.body);
  return {
    id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    category: a.category,
    cover: cover || CATEGORY_FALLBACK_COVER[a.category] || "/brand/og-default.jpg",
    author,
    relatedServices: a.related,
    readMinutes: rt.minutes,
    wordCount: rt.words,
    publishedAt: "2025-06-15T08:00:00.000Z",
    updatedAt: "2025-06-15T08:00:00.000Z",
    tags: a.related.map((slug) => getService(slug)?.title ?? slug),
  };
}

export const ARTICLES: ArticleView[] = [
  ...ARTICLES_SEED.map((a, i) =>
    toView(a, "", "دفتر خدمات سلامت ۴۷۷", `art-${i + 1}`),
  ),
  ...ARTICLE_PACK.map((a, i) => toView(a, `/images/articles/${a.cover}`, "تیم محتوای دفتر خدمات سلامت ۴۷۷", `artp-${i + 1}`)),
];

export const ARTICLE_CATEGORIES = Array.from(new Set(ARTICLES.map((a) => a.category)));

export function getArticle(slug: string): ArticleView | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3): ArticleView[] {
  const current = getArticle(slug);
  if (!current) return ARTICLES.slice(0, limit);
  const sameCategory = ARTICLES.filter((a) => a.slug !== slug && a.category === current.category);
  const sameService = ARTICLES.filter(
    (a) => a.slug !== slug && a.relatedServices.some((s) => current.relatedServices.includes(s)),
  );
  const merged = [...sameCategory, ...sameService.filter((a) => !sameCategory.includes(a))];
  const rest = ARTICLES.filter((a) => a.slug !== slug && !merged.includes(a));
  return [...merged, ...rest].slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * جست‌وجوی سراسری
 * ------------------------------------------------------------------ */

export interface SearchHit {
  type: "service" | "article" | "faq" | "page";
  title: string;
  description: string;
  href: string;
  icon: string;
  keywords: string;
  badge?: string;
}

export const STATIC_PAGES: SearchHit[] = [
  {
    type: "page",
    title: "ثبت درخواست آنلاین",
    description: "فرم چندمرحله‌ای ثبت درخواست با کد پیگیری",
    href: "/request",
    icon: "send",
    keywords: "ثبت درخواست فرم آنلاین ارسال درخواست",
    badge: "خدمات",
  },
  {
    type: "page",
    title: "پیگیری درخواست",
    description: "مشاهده وضعیت درخواست با کد پیگیری و چهار رقم آخر تماس",
    href: "/track",
    icon: "track",
    keywords: "پیگیری کد رهگیری وضعیت درخواست",
    badge: "خدمات",
  },
  {
    type: "page",
    title: "کارتابل من",
    description: "فهرست درخواست‌های ثبت‌شده در این مرورگر",
    href: "/my-requests",
    icon: "user",
    keywords: "کارتابل درخواست‌های من",
  },
  {
    type: "page",
    title: "راهنمای گام‌به‌گام",
    description: "از انتخاب خدمت تا دریافت نتیجه، مرحله‌به‌مرحله",
    href: "/guide",
    icon: "book2",
    keywords: "راهنما آموزش مراحل گام",
  },
  {
    type: "page",
    title: "پرسش‌های متداول",
    description: "پاسخ به پرتکرارترین پرسش‌ها درباره خدمات",
    href: "/faq",
    icon: "chat",
    keywords: "سوال متداول پرسش پاسخ",
  },
  {
    type: "page",
    title: "تماس و موقعیت دفتر",
    description: "نشانی، شماره‌ها، ساعات کاری و مسیریابی",
    href: "/contact",
    icon: "pin",
    keywords: "تماس نشانی آدرس تلفن نقشه مسیریابی",
  },
  {
    type: "page",
    title: "درباره دفتر خدمات سلامت ۴۷۷",
    description: "معرفی دفتر، ارزش‌ها و تیم",
    href: "/about",
    icon: "badge",
    keywords: "درباره ما معرفی تیم",
  },
  {
    type: "page",
    title: "حریم خصوصی",
    description: "نحوه نگهداری و استفاده از اطلاعات",
    href: "/privacy",
    icon: "lock",
    keywords: "حریم خصوصی اطلاعات امنیت",
  },
  {
    type: "page",
    title: "شرایط استفاده",
    description: "قواعد استفاده از سامانه و ماهیت ثبت درخواست",
    href: "/terms",
    icon: "alert",
    keywords: "قوانین شرایط استفاده",
  },
  {
    type: "page",
    title: "وضعیت سامانه",
    description: "شاخص دسترس‌پذیری بخش‌های مختلف سایت",
    href: "/status",
    icon: "shield",
    keywords: "وضعیت سامانه دسترس پذیری آپ‌تایم",
  },
  {
    type: "page",
    title: "پیشخوان مدیریت",
    description: "نسخه نمایشی پنل مدیریت درخواست‌ها و محتوا",
    href: "/admin",
    icon: "shield",
    keywords: "پنل مدیریت پیشخوان ادمین",
    badge: "مدیریت",
  },
];

/**
 * نمایه سبک برای جست‌وجوی فوری در مرورگر (بدون متن کامل مقالات)
 * جست‌وجوی متن کامل در صفحه /search روی سرور انجام می‌شود.
 */
export const SEARCH_INDEX: SearchHit[] = [
  ...STATIC_PAGES,
  ...SERVICES.map<SearchHit>((s) => ({
    type: "service",
    title: s.title,
    description: s.summary,
    href: `/services/${s.slug}`,
    icon: s.icon,
    keywords: `${s.title} ${s.tagline} ${s.tags.join(" ")} ${s.audienceLabel}`,
    badge: s.duration,
  })),
  ...ARTICLES.map<SearchHit>((a) => ({
    type: "article",
    title: a.title,
    description: a.excerpt,
    href: `/articles/${a.slug}`,
    icon: "book",
    keywords: `${a.title} ${a.category} ${a.tags.join(" ")}`,
    badge: a.category,
  })),
  ...FAQS.map<SearchHit>((f) => ({
    type: "faq",
    title: f.question,
    description: f.plainAnswer.slice(0, 160),
    href: `/faq#${f.id}`,
    icon: "chat",
    keywords: `${f.question} ${f.category}`,
    badge: f.category,
  })),
];

export { SERVICES_SEED, FIELDS_SEED, FAQS_SEED, ARTICLES_SEED };

/* ------------------------------------------------------------------ *
 * جست‌وجوی متن کامل (روی سرور، شامل متن مقالات و پاسخ پرسش‌ها)
 * ------------------------------------------------------------------ */

export interface FullSearchResult {
  hits: SearchHit[];
  total: number;
  groups: Record<SearchHit["type"], SearchHit[]>;
}

export function searchFullText(query: string, limit = 60): FullSearchResult {
  const q = normalizeFa(query);
  if (!q || q.length < 2) {
    return { hits: [], total: 0, groups: { service: [], article: [], faq: [], page: [] } };
  }
  const scored: Array<{ hit: SearchHit; score: number }> = [];

  const scoreOf = (title: string, body: string): number => {
    const t = normalizeFa(title);
    const b = normalizeFa(body);
    let score = 0;
    if (t === q) score += 120;
    if (t.includes(q)) score += 60;
    if (t.split(" ").some((w) => w.startsWith(q))) score += 24;
    const occurrences = b.split(q).length - 1;
    score += Math.min(30, occurrences * 3);
    return score;
  };

  for (const hit of STATIC_PAGES) {
    const score = scoreOf(hit.title, `${hit.description} ${hit.keywords}`);
    if (score > 0) scored.push({ hit, score });
  }
  for (const s of SERVICES) {
    const score = scoreOf(s.title, `${s.summary} ${s.tagline} ${stripMarkdown(s.intro)} ${stripMarkdown(s.process)} ${stripMarkdown(s.documents)} ${s.tags.join(" ")}`);
    if (score > 0)
      scored.push({
        hit: {
          type: "service",
          title: s.title,
          description: s.summary,
          href: `/services/${s.slug}`,
          icon: s.icon,
          keywords: "",
          badge: "خدمت",
        },
        score: score + 8,
      });
  }
  for (const a of ARTICLES) {
    const score = scoreOf(a.title, `${a.excerpt} ${stripMarkdown(a.body)} ${a.category} ${a.tags.join(" ")}`);
    if (score > 0)
      scored.push({
        hit: {
          type: "article",
          title: a.title,
          description: a.excerpt,
          href: `/articles/${a.slug}`,
          icon: "book",
          keywords: "",
          badge: a.category,
        },
        score,
      });
  }
  for (const f of FAQS) {
    const score = scoreOf(f.question, `${f.plainAnswer} ${f.category}`);
    if (score > 0)
      scored.push({
        hit: {
          type: "faq",
          title: f.question,
          description: f.plainAnswer.slice(0, 180),
          href: `/faq#${f.id}`,
          icon: "chat",
          keywords: "",
          badge: f.category,
        },
        score: score + 4,
      });
  }

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.slice(0, limit).map((s) => s.hit);
  const groups: FullSearchResult["groups"] = { service: [], article: [], faq: [], page: [] };
  for (const hit of hits) groups[hit.type].push(hit);
  return { hits, total: scored.length, groups };
}
