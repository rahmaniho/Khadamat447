/**
 * داده‌های نمایشی سامانه (Demo Seed)
 * ---------------------------------------------------------------
 * یک مجموعه واقع‌نما از درخواست‌ها، کاربران، اعلان‌ها و رویدادها تا همه
 * بخش‌های سامانه با داده‌ی معنادار قابل بررسی باشد.
 * زمان‌ها نسبت به «اکنون» تولید می‌شوند و در مرورگر کاربر ذخیره می‌گردند.
 */
import { SERVICES_SEED, FAQS_SEED, FIELDS_SEED, ARTICLES_SEED } from "@/lib/content/catalog";
import { ARTICLE_PACK } from "@/lib/content/knowledge";
import { SERVICE_UI, SITE } from "@/lib/content/site";
import { readingTime, formatDate } from "@/lib/format";
import type {
  AppState,
  ArticleRecord,
  Attachment,
  AuditRecord,
  FaqRecord,
  NewRequestInput,
  NotificationRecord,
  Priority,
  RequestRecord,
  RequestStatus,
  ServiceField,
  ServiceRecord,
  StatusEvent,
  UserRecord,
  AnnouncementRecord,
  SettingsRecord,
} from "./types";

/** زمان پایه ثابت — برای یکسان‌بودن رندر سرور و مرورگر */
export const FIXED_NOW = "2026-10-11T06:30:00.000Z";
export const STORAGE_KEY = "khadamat447.demo.state.v1";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** کد پیگیری قطعی و یکتا بر پایه شمارنده */
export function codeFromIndex(i: number): string {
  let n = (i * 2_654_435_761 + 7) % 4_294_967_296;
  let s = "";
  for (let k = 0; k < 10; k++) {
    s += CODE_ALPHABET[n % CODE_ALPHABET.length];
    n = Math.floor(n / CODE_ALPHABET.length) + (k + 1) * 977;
  }
  return `K447-${s.slice(0, 5)}-${s.slice(5)}`;
}

export function randomTrackingCode(): string {
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 10; i++) bytes[i] = Math.floor(Math.random() * 256);
  let s = "";
  for (let i = 0; i < 10; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `K447-${s.slice(0, 5)}-${s.slice(5)}`;
}

export function id(prefix: string, n = 1): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ *
 * خدمات
 * ------------------------------------------------------------------ */

const GROUP_OF: Record<string, string[]> = {
  service: [
    "request_kind",
    "course_type",
    "qualification_type",
    "contract_type",
    "request_subject",
    "workplace_type",
    "unit_type",
  ],
};

function mapField(seed: (typeof FIELDS_SEED)[number], index: number): ServiceField {
  const inServiceGroup = (GROUP_OF.service ?? []).includes(seed.field_key);
  const type = (["text", "number", "select", "textarea", "date", "tel", "email", "checkbox"] as const).includes(
    seed.type as never,
  )
    ? (seed.type as ServiceField["type"])
    : "text";
  return {
    id: id("fld", index + 1),
    key: seed.field_key,
    label: seed.label,
    type,
    options: seed.options,
    placeholder: seed.placeholder,
    help: seed.help_text,
    required: Boolean(seed.required),
    group: inServiceGroup ? "service" : "extra",
  };
}

export function buildServices(now: Date): ServiceRecord[] {
  const iso = now.toISOString();
  let fieldIndex = 0;
  return SERVICES_SEED.map((s, i) => {
    const ui = SERVICE_UI[s.slug];
    const fields = FIELDS_SEED.filter((f) => f.service === s.slug).map((f) => mapField(f, fieldIndex++));
    return {
      slug: s.slug,
      title: s.title,
      tagline: s.tagline,
      summary: s.summary,
      icon: ui?.icon ?? s.icon,
      emoji: ui?.emoji ?? "📄",
      gradient: ui?.gradient ?? "from-brand-500 to-brand-700",
      accent: ui?.accent ?? "text-brand-700 bg-brand-50",
      featured: Boolean(s.featured),
      active: true,
      sortOrder: s.sort_order,
      maxAttachments: s.max_attachments,
      duration: ui?.duration ?? "—",
      audience: ui?.audience ?? "",
      highlights: ui?.highlights ?? [],
      deliverables: ui?.deliverables ?? [],
      tags: ui?.tags ?? [],
      popular: Boolean(ui?.popular),
      fields,
      updatedAt: iso,
      requestsCount: 0,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "fa"));
}

/* ------------------------------------------------------------------ *
 * پرسش‌های متداول
 * ------------------------------------------------------------------ */

const FAQ_CATEGORY: Record<string, string> = {
  "health-card": "کارت بهداشت",
  "health-training": "آموزش بهداشت",
  "health-qualification": "صلاحیت بهداشت",
  "audit-contracts": "ممیزی و قرارداد",
  other: "عمومی",
};

function faqCategoryFor(serviceSlug: string | null, question: string): string {
  if (serviceSlug && FAQ_CATEGORY[serviceSlug]) return FAQ_CATEGORY[serviceSlug];
  if (/پیگیری|کد/.test(question)) return "پیگیری درخواست";
  if (/اطلاعات|خصوصی|مدارک/.test(question)) return "حریم خصوصی";
  if (/هزینه|زمان|مدت/.test(question)) return "زمان و هزینه";
  return "عمومی";
}

export function buildFaqs(now: Date): FaqRecord[] {
  const iso = now.toISOString();
  return FAQS_SEED.map((f, i) => ({
    id: id("faq", i + 1),
    question: f.question,
    answer: f.answer,
    category: faqCategoryFor(f.service ?? null, f.question),
    serviceSlug: f.service ?? null,
    published: true,
    pinned: i < 3,
    views: 320 - i * 17,
    helpful: 44 - i * 2,
    updatedAt: iso,
  }));
}

/* ------------------------------------------------------------------ *
 * مقالات
 * ------------------------------------------------------------------ */

export function buildArticles(now: Date): ArticleRecord[] {
  const iso = now.toISOString();
  const base: ArticleRecord[] = ARTICLES_SEED.map((a, i) => ({
    id: id("art", i + 1),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    category: a.category,
    cover: "",
    author: "دفتر خدمات سلامت ۴۷۷",
    status: a.status === "published" ? "published" : "draft",
    relatedServices: a.related,
    tags: a.related.map((r) => r.replace(/-/g, " ")),
    readMinutes: readingTime(a.body).minutes,
    views: 210 + i * 13,
    publishedAt: a.status === "published" ? iso : null,
    updatedAt: iso,
  }));
  const pack: ArticleRecord[] = ARTICLE_PACK.map((a, i) => ({
    id: id("artp", i + 1),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    category: a.category,
    cover: `/images/articles/${a.cover}`,
    author: "تیم محتوای دفتر خدمات سلامت ۴۷۷",
    status: "published",
    relatedServices: a.related,
    tags: a.related.map((r) => r.replace(/-/g, " ")),
    readMinutes: readingTime(a.body).minutes,
    views: 380 + i * 21,
    publishedAt: iso,
    updatedAt: iso,
  }));
  return [...base, ...pack];
}

/* ------------------------------------------------------------------ *
 * کاربران
 * ------------------------------------------------------------------ */

export const DEMO_CREDENTIALS = { email: "admin@khadamat447.ir", password: "447477" };

function buildUsers(now: Date): UserRecord[] {
  const t = now.getTime();
  const at = (days: number) => new Date(t - days * 86_400_000).toISOString();
  return [
    {
      id: "usr-0001",
      name: "مدیر کل دفتر",
      email: DEMO_CREDENTIALS.email,
      role: "owner",
      active: true,
      avatarColor: "#1e7a71",
      lastLoginAt: at(0),
      createdAt: at(320),
    },
    {
      id: "usr-0002",
      name: "سارا رحیمی",
      email: "reviewer@khadamat447.ir",
      role: "reviewer",
      active: true,
      avatarColor: "#0ea5e9",
      lastLoginAt: at(0),
      createdAt: at(210),
    },
    {
      id: "usr-0003",
      name: "محمد کاظمی",
      email: "content@khadamat447.ir",
      role: "content",
      active: true,
      avatarColor: "#f59e0b",
      lastLoginAt: at(2),
      createdAt: at(140),
    },
    {
      id: "usr-0004",
      name: "نگار موسوی",
      email: "support@khadamat447.ir",
      role: "support",
      active: true,
      avatarColor: "#8b5cf6",
      lastLoginAt: at(1),
      createdAt: at(95),
    },
    {
      id: "usr-0005",
      name: "بهنام یوسفی",
      email: "b.yousefi@khadamat447.ir",
      role: "reviewer",
      active: false,
      avatarColor: "#94a3b8",
      lastLoginAt: at(38),
      createdAt: at(260),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * درخواست‌ها
 * ------------------------------------------------------------------ */

interface Template {
  name: string;
  phone: string;
  service: string;
  status: RequestStatus;
  days: number;
  priority?: Priority;
  org?: string;
  type?: "person" | "company";
  pref?: string;
  city?: string;
  summary: string;
  tags?: string[];
  rating?: number;
}

const TEMPLATES: Template[] = [
  {
    name: "رضا محمدی",
    phone: "09121234567",
    service: "health-card",
    status: "completed",
    days: 26,
    org: "رستوران باغ طالقانی",
    type: "company",
    summary: "درخواست کارت بهداشت برای سه نفر از پرسنل آشپزخانه",
    tags: ["کارت بهداشت", "پرسنل"],
    rating: 5,
  },
  {
    name: "سمیرا کاظمی",
    phone: "09352233445",
    service: "health-training",
    status: "completed",
    days: 23,
    org: "سالن زیبایی نگین",
    type: "company",
    summary: "ثبت‌نام دوره بازآموزی بهداشت برای دو نفر",
    tags: ["آموزش", "بازآموزی"],
    rating: 5,
  },
  {
    name: "حسین طاهری",
    phone: "09195556677",
    service: "health-qualification",
    status: "ready_to_report",
    days: 9,
    org: "صنایع بسته‌بندی مهر",
    type: "company",
    priority: "high",
    summary: "تمدید صلاحیت بهداشت برای خط تولید بسته‌بندی",
    tags: ["صلاحیت", "تمدید"],
  },
  {
    name: "مریم اسدی",
    phone: "09128887766",
    service: "audit-contracts",
    status: "in_review",
    days: 5,
    org: "مهدکودک مهرآوران",
    type: "company",
    summary: "هماهنگی ممیزی بهداشتی و بازبینی قرارداد خدمات",
    tags: ["ممیزی", "قرارداد"],
  },
  {
    name: "علی نوروزی",
    phone: "09361112233",
    service: "other",
    status: "needs_info",
    days: 4,
    summary: "پرسش درباره مدارک لازم برای فعالیت در حوزه توزیع مواد غذایی",
    tags: ["پرسش"],
  },
  {
    name: "زهرا شریفی",
    phone: "09124445566",
    service: "health-card",
    status: "in_review",
    days: 3,
    org: "کافه راز",
    type: "company",
    summary: "درخواست المثنی کارت بهداشت به دلیل مفقود شدن کارت",
    tags: ["المثنی"],
  },
  {
    name: "امیر حسین‌زاده",
    phone: "09301239876",
    service: "health-card",
    status: "pending_review",
    days: 3,
    org: "سوپرمارکت خلیج فارس",
    type: "company",
    summary: "درخواست جدید کارت بهداشت برای متصدی صندوق",
    tags: ["کارت بهداشت"],
  },
  {
    name: "فاطمه رضایی",
    phone: "09198887711",
    service: "health-training",
    status: "pending_review",
    days: 2,
    org: "قنادی گلستان",
    type: "company",
    summary: "هماهنگی کارگاه آموزشی گروهی برای ۹ نفر از کارکنان",
    tags: ["کارگاه", "گروهی"],
  },
  {
    name: "محسن کریمی",
    phone: "09375559911",
    service: "health-qualification",
    status: "new",
    days: 2,
    org: "انبار مواد غذایی کارون",
    type: "company",
    priority: "high",
    summary: "صدور صلاحیت بهداشت برای انبار جدید در شهرک صنعتی",
    tags: ["انبار", "صلاحیت"],
  },
  {
    name: "نرگس بیات",
    phone: "09123334455",
    service: "other",
    status: "new",
    days: 1,
    summary: "درخواست راهنمایی برای شروع به فعالیت کارگاه تولید لبنیات",
    tags: ["مشاوره"],
  },
  {
    name: "سعید فتحی",
    phone: "09361119988",
    service: "audit-contracts",
    status: "in_review",
    days: 6,
    org: "بیمارستان خصوصی مهر",
    type: "company",
    priority: "urgent",
    summary: "ممیزی داخلی بخش تغذیه و آشپزخانه بیمارستان",
    tags: ["ممیزی", "بیمارستان"],
  },
  {
    name: "لیلا صادقی",
    phone: "09127778899",
    service: "health-card",
    status: "completed",
    days: 18,
    org: "آرایشگاه ماهور",
    type: "company",
    summary: "درخواست کارت بهداشت برای دو پرسنل جدید",
    tags: ["کارت بهداشت"],
    rating: 4,
  },
  {
    name: "بهرام نجفی",
    phone: "09351234567",
    service: "health-qualification",
    status: "rejected",
    days: 21,
    org: "واحد توزیع نوشیدنی",
    type: "company",
    summary: "صدور صلاحیت برای واحد فاقد مستندات محل فعالیت",
    tags: ["صلاحیت", "ردشده"],
  },
  {
    name: "شیما قربانی",
    phone: "09190001122",
    service: "health-training",
    status: "completed",
    days: 14,
    org: "رستوران دربند",
    type: "company",
    summary: "ثبت‌نام دوره بهداشت عمومی اصناف",
    tags: ["آموزش"],
    rating: 5,
  },
  {
    name: "کامران یاری",
    phone: "09383334455",
    service: "other",
    status: "completed",
    days: 11,
    summary: "پرسش درباره نحوه استعلام وضعیت پرونده واحد صنفی",
    tags: ["استعلام"],
    rating: 4,
  },
  {
    name: "هانیه ملکی",
    phone: "09124448877",
    service: "health-card",
    status: "needs_info",
    days: 7,
    org: "فست‌فود برگرلند",
    type: "company",
    summary: "درخواست کارت بهداشت؛ نیازمند تصویر پرسنلی جدید",
    tags: ["نیازمند مدرک"],
  },
  {
    name: "داوود اسکندری",
    phone: "09371239876",
    service: "audit-contracts",
    status: "ready_to_report",
    days: 12,
    org: "کارخانه لبنیات پاک‌دام",
    type: "company",
    summary: "هماهنگی ممیزی سالانه و تنظیم چک‌لیست آمادگی",
    tags: ["ممیزی", "سالانه"],
  },
  {
    name: "پریناز اکبری",
    phone: "09198883322",
    service: "health-card",
    status: "completed",
    days: 32,
    org: "بستنی فروشی ونوشه",
    type: "company",
    summary: "تمدید کارت بهداشت پرسنل فروش",
    tags: ["تمدید"],
    rating: 5,
  },
  {
    name: "یاسر شمس",
    phone: "09351119977",
    service: "health-qualification",
    status: "pending_review",
    days: 1,
    org: "آشپزخانه صنعتی سام",
    type: "company",
    summary: "بازبینی صلاحیت بهداشت پس از تغییر محل کارگاه",
    tags: ["بازبینی"],
  },
  {
    name: "مینا فلاح",
    phone: "09122223344",
    service: "health-training",
    status: "in_review",
    days: 4,
    org: "مهدکودک آیندگان",
    type: "company",
    summary: "کارگاه آموزشی بهداشت فردی برای مربیان",
    tags: ["کارگاه"],
  },
  {
    name: "احسان راد",
    phone: "09369998877",
    service: "other",
    status: "completed",
    days: 8,
    org: "توزیع مواد شوینده",
    type: "company",
    summary: "درخواست راهنمایی درباره الزامات نگهداری مواد شوینده",
    tags: ["الزامات"],
    rating: 4,
  },
  {
    name: "مهدی جلایی",
    phone: "09125556677",
    service: "health-card",
    status: "in_review",
    days: 2,
    org: "نانوایی سنگک طالقانی",
    type: "company",
    summary: "درخواست کارت بهداشت برای دو کارگر نانوا",
    tags: ["کارت بهداشت", "نانوایی"],
  },
  {
    name: "رویا نوری",
    phone: "09338887755",
    service: "audit-contracts",
    status: "new",
    days: 1,
    org: "باشگاه ورزشی پارس",
    type: "company",
    summary: "درخواست ممیزی بهداشتی سالن و رختکن",
    tags: ["ممیزی", "باشگاه"],
  },
  {
    name: "بابک معینی",
    phone: "09121112233",
    service: "health-qualification",
    status: "completed",
    days: 40,
    org: "قنادی شیرین‌کام",
    type: "company",
    summary: "صدور صلاحیت بهداشت بار اول",
    tags: ["صلاحیت"],
    rating: 5,
  },
  {
    name: "آرزو دهقان",
    phone: "09374445566",
    service: "health-card",
    status: "pending_review",
    days: 0,
    org: "کافه کتاب معرفت",
    type: "company",
    summary: "درخواست کارت بهداشت برای باریستا",
    tags: ["کارت بهداشت", "کافه"],
  },
  {
    name: "سینا براتی",
    phone: "09197773322",
    service: "health-training",
    status: "new",
    days: 0,
    summary: "پرسش درباره زمان برگزاری دوره بعدی بهداشت اصناف",
    tags: ["پرسش", "دوره"],
  },
  {
    name: "طاهره قاسمی",
    phone: "09128881144",
    service: "other",
    status: "needs_info",
    days: 6,
    org: "کارگاه تولید ترشیجات",
    type: "company",
    summary: "درخواست مشاوره برای راه‌اندازی کارگاه؛ نیازمند شرح فرایند",
    tags: ["مشاوره"],
  },
  {
    name: "مجتبی فرهادی",
    phone: "09301237788",
    service: "audit-contracts",
    status: "completed",
    days: 30,
    org: "هتل خلیج فارس",
    type: "company",
    summary: "ممیزی بهداشتی بخش رستوران و صبحانه",
    tags: ["ممیزی", "هتل"],
    rating: 5,
  },
];

const ASSIGNEES = ["سارا رحیمی", "نگار موسوی", "بهنام یوسفی", "مدیر کل دفتر"];

function answersFor(serviceSlug: string, tpl: Template, services: ServiceRecord[]) {
  const service = services.find((s) => s.slug === serviceSlug);
  if (!service) return [] as RequestRecord["answers"];
  const org = tpl.org || "—";
  const values: Record<string, string> = {
    "health-card": `درخواست کارت بهداشت — ${org}`,
    "health-training": "دوره بهداشت عمومی ویژه اصناف",
    "health-qualification": "صدور صلاحیت بهداشت (بار اول)",
    "audit-contracts": "هماهنگی ممیزی بهداشتی",
    other: org,
  };
  return service.fields.map((f) => ({
    key: f.key,
    label: f.label,
    value:
      f.type === "select" && f.options?.length
        ? (values[serviceSlug] && f.options.includes(values[serviceSlug]) ? values[serviceSlug] : f.options[0])
        : f.key.includes("count") || f.type === "number"
          ? tpl.type === "company"
            ? "۲"
            : "۱"
          : f.key.includes("name")
            ? org
            : f.key.includes("address")
              ? SITE.addressFull
              : f.key.includes("time")
                ? "روزهای فرد، بعدازظهر"
                : tpl.summary,
  }));
}

function attachmentsFor(i: number, tpl: Template): Attachment[] {
  if (i % 5 === 3) return [];
  const count = (i % 3) + 1;
  const kinds = [
    { name: "تصویر کارت ملی.jpg", ext: "jpg", type: "image/jpeg" },
    { name: "عکس پرسنلی.png", ext: "png", type: "image/png" },
    { name: "مدارک محل فعالیت.pdf", ext: "pdf", type: "application/pdf" },
    { name: "قرارداد امضاشده.pdf", ext: "pdf", type: "application/pdf" },
  ];
  return Array.from({ length: count }, (_, k) => {
    const kind = kinds[(i + k) % kinds.length];
    return {
      id: `att-${i + 1}-${k + 1}`,
      name: kind.name,
      size: 120_000 + ((i * 37 + k * 53) % 900) * 1000,
      type: kind.type,
      ext: kind.ext,
      uploadedAt: new Date(Date.now() - (tpl.days * 86_400_000 + k * 3_600_000)).toISOString(),
      verified: k === 0 && i % 2 === 0,
    };
  });
}

function timelineFor(tpl: Template, createdAt: string, updatedAt: string): StatusEvent[] {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();
  const span = Math.max(end - start, 3_600_000);
  const flow: RequestStatus[] = ["new", "pending_review", "in_review", "ready_to_report", "completed"];
  const targetIndex = tpl.status === "rejected" ? 4 : Math.max(0, flow.indexOf(tpl.status) === -1 ? 2 : flow.indexOf(tpl.status));
  const events: StatusEvent[] = [
    {
      id: `ev-${tpl.phone}-0`,
      at: createdAt,
      status: "new",
      note: "درخواست از طریق فرم آنلاین سایت ثبت شد.",
      actor: "سامانه",
      visibility: "public",
    },
  ];
  for (let i = 1; i <= targetIndex; i++) {
    const at = new Date(start + (span * i) / (targetIndex + 0.6)).toISOString();
    const status = i === targetIndex && tpl.status === "rejected" ? "rejected" : flow[i];
    if (!status) continue;
    const notes: Partial<Record<RequestStatus, string>> = {
      pending_review: "درخواست در صف بررسی قرار گرفت.",
      in_review: "بررسی مدارک توسط کارشناس آغاز شد.",
      ready_to_report: "بررسی انجام شد و نتیجه در حال نهایی‌سازی است.",
      completed: "فرایند رسیدگی پایان یافت و نتیجه اعلام شد.",
      rejected: "پس از بررسی، درخواست قابل پذیرش تشخیص داده نشد.",
      needs_info: "برای ادامه رسیدگی، تکمیل اطلاعات لازم است.",
    };
    events.push({
      id: `ev-${tpl.phone}-${i}`,
      at,
      status,
      note: notes[status] ?? "وضعیت درخواست به‌روزرسانی شد.",
      actor: ASSIGNEES[i % ASSIGNEES.length],
      visibility: "public",
      channel: i === targetIndex ? "sms" : undefined,
    });
  }
  if (tpl.status === "needs_info") {
    events.push({
      id: `ev-${tpl.phone}-info`,
      at: new Date(start + span * 0.55).toISOString(),
      status: "needs_info",
      note: "تصویر پرسنلی با زمینه روشن و بدون کلاه لازم است. لطفاً فایل جدید بارگذاری شود.",
      actor: "سارا رحیمی",
      visibility: "public",
      channel: "sms",
    });
  }
  return events;
}

function buildRequests(services: ServiceRecord[], now: Date): RequestRecord[] {
  const requestList = TEMPLATES.map((tpl, i) => {
    const createdAt = new Date(now.getTime() - (tpl.days * 86_400_000 + ((i * 7) % 9) * 3_600_000)).toISOString();
    const latest = tpl.status === "new" ? createdAt : new Date(now.getTime() - Math.max(0, tpl.days - 1) * 86_400_000).toISOString();
    const service = services.find((s) => s.slug === tpl.service);
    return {
      id: id("req", i + 1),
      trackingCode: codeFromIndex(i + 1),
      serviceSlug: tpl.service,
      serviceTitle: service?.title ?? tpl.service,
      fullName: tpl.name,
      phone: tpl.phone,
      email: "",
      requesterType: tpl.type ?? "person",
      organization: tpl.org ?? "",
      contactPreference: (tpl.pref as RequestRecord["contactPreference"]) ?? "sms",
      city: "قزوین",
      summary: tpl.summary,
      answers: answersFor(tpl.service, tpl, services),
      attachments: attachmentsFor(i, tpl),
      consent: true,
      newsletter: i % 3 === 0,
      status: tpl.status,
      priority: tpl.priority ?? (i % 7 === 0 ? "high" : "normal"),
      assignee: tpl.status === "new" ? "" : ASSIGNEES[i % ASSIGNEES.length],
      tags: tpl.tags ?? [],
      createdAt,
      updatedAt: latest,
      dueAt: new Date(new Date(createdAt).getTime() + 3 * 86_400_000).toISOString(),
      timeline: timelineFor(tpl, createdAt, latest),
      notes:
        i % 4 === 0
          ? [
              {
                id: `note-${i}`,
                at: latest,
                author: ASSIGNEES[i % ASSIGNEES.length],
                body:
                  i % 8 === 0
                    ? "مدارک اولیه کامل است. برای تأیید نهایی، استعلام داخلی در حال انجام است."
                    : "با متقاضی تماس گرفته شد و توضیحات لازم ارائه شد.",
              },
            ]
          : [],
      rating: tpl.rating,
      source: (i % 9 === 0 ? "phone" : "web") as RequestRecord["source"],
    } satisfies RequestRecord;
  });
  return requestList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildNotifications(requests: RequestRecord[], now: Date): NotificationRecord[] {
  const list: NotificationRecord[] = [];
  requests.forEach((r, i) => {
    const first = r.timeline[0];
    list.push({
      id: id("ntf", list.length + 1),
      channel: "email",
      recipient: "Info@Khadamat447.IR",
      subject: `درخواست جدید — ${r.serviceTitle}`,
      body: `درخواست جدیدی با کد پیگیری ${r.trackingCode} از طرف ${r.fullName} ثبت شد.`,
      status: "sent",
      attempts: 1,
      requestId: r.id,
      trackingCode: r.trackingCode,
      createdAt: first?.at ?? r.createdAt,
      sentAt: first?.at ?? r.createdAt,
      error: null,
    });
    const smsFailed = i % 7 === 1;
    list.push({
      id: id("ntf", list.length + 1),
      channel: "sms",
      recipient: r.phone,
      subject: "تأیید ثبت درخواست",
      body: `درخواست شما با کد ${r.trackingCode} ثبت شد. وضعیت را در سایت پیگیری کنید.`,
      status: smsFailed ? "failed" : "sent",
      attempts: smsFailed ? 2 : 1,
      requestId: r.id,
      trackingCode: r.trackingCode,
      createdAt: new Date(new Date(r.createdAt).getTime() + 60_000).toISOString(),
      sentAt: smsFailed ? null : new Date(new Date(r.createdAt).getTime() + 120_000).toISOString(),
      error: smsFailed ? "عدم پاسخ سرویس پیامک (کد ۴۲۹) — در صف ارسال مجدد" : null,
    });
    const last = r.timeline[r.timeline.length - 1];
    if (r.status !== "new" && last) {
      list.push({
        id: id("ntf", list.length + 1),
        channel: "email",
        recipient: `${r.fullName.replace(/\s/g, ".")}@example.com`,
        subject: `تغییر وضعیت درخواست ${r.trackingCode}`,
        body: `وضعیت درخواست شما به‌روزرسانی شد: ${last.note}`,
        status: i % 5 === 3 ? "queued" : "sent",
        attempts: i % 5 === 3 ? 0 : 1,
        requestId: r.id,
        trackingCode: r.trackingCode,
        createdAt: last.at,
        sentAt: i % 5 === 3 ? null : last.at,
        error: null,
      });
    }
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildAudit(requests: RequestRecord[], now: Date): AuditRecord[] {
  const entries: AuditRecord[] = [
    {
      id: id("aud", 1),
      at: new Date(now.getTime() - 3_600_000).toISOString(),
      actor: "مدیر کل دفتر",
      action: "ورود به پیشخوان",
      entity: "session",
      entityId: "usr-0001",
      detail: "ورود موفق از مرورگر Chrome — IP ثبت‌شده به‌صورت هش",
      severity: "info",
    },
    {
      id: id("aud", 2),
      at: new Date(now.getTime() - 7_200_000).toISOString(),
      actor: "سارا رحیمی",
      action: "تغییر وضعیت درخواست",
      entity: "request",
      entityId: requests[1]?.id ?? "",
      detail: `${requests[1]?.trackingCode ?? ""}: در حال بررسی → آماده اعلام نتیجه`,
      severity: "info",
    },
    {
      id: id("aud", 3),
      at: new Date(now.getTime() - 10_800_000).toISOString(),
      actor: "نگار موسوی",
      action: "مشاهده مدرک",
      entity: "attachment",
      entityId: "att-0008-1",
      detail: "مشاهده فایل «عکس پرسنلی.png» — دسترسی ثبت شد",
      severity: "warning",
    },
    {
      id: id("aud", 4),
      at: new Date(now.getTime() - 18_000_000).toISOString(),
      actor: "محمد کاظمی",
      action: "ویرایش مقاله",
      entity: "article",
      entityId: "artp-0003",
      detail: "به‌روزرسانی متن راهنمای مدارک کارت بهداشت",
      severity: "info",
    },
    {
      id: id("aud", 5),
      at: new Date(now.getTime() - 26_000_000).toISOString(),
      actor: "سامانه",
      action: "ارسال ناموفق اعلان",
      entity: "notification",
      entityId: "ntf-0007",
      detail: "سرویس پیامک پاسخ نداد؛ پیام در صف ارسال مجدد قرار گرفت",
      severity: "warning",
    },
    {
      id: id("aud", 6),
      at: new Date(now.getTime() - 40_000_000).toISOString(),
      actor: "بهنام یوسفی",
      action: "ورود ناموفق",
      entity: "session",
      entityId: "unknown",
      detail: "سه تلاش ناموفق برای ورود به حساب support@ — حساب موقتاً محدود شد",
      severity: "critical",
    },
    {
      id: id("aud", 7),
      at: new Date(now.getTime() - 54_000_000).toISOString(),
      actor: "مدیر کل دفتر",
      action: "تغییر تنظیمات",
      entity: "settings",
      entityId: "notify.sms",
      detail: "کانال اطلاع‌رسانی پیامکی فعال شد",
      severity: "info",
    },
  ];
  return entries;
}

function buildAnnouncements(now: Date): AnnouncementRecord[] {
  const iso = now.toISOString();
  return [
    {
      id: "ann-0001",
      title: "دوره جدید آموزش بهداشت اصناف",
      body: "ثبت‌نام دوره عمومی بهداشت اصناف آغاز شد. برای شرکت در دوره، از فرم «آموزش بهداشت اصناف» استفاده کنید.",
      level: "info",
      active: true,
      startsAt: iso,
      endsAt: null,
      createdAt: iso,
    },
    {
      id: "ann-0002",
      title: "به‌روزرسانی مدارک کارت بهداشت",
      body: "برای درخواست‌های تمدید، تصویر کارت قبلی را نیز بارگذاری کنید تا بررسی سریع‌تر انجام شود.",
      level: "success",
      active: true,
      startsAt: iso,
      endsAt: null,
      createdAt: iso,
    },
    {
      id: "ann-0003",
      title: "تعطیلی موقت بخش آموزش",
      body: "برنامه آموزشی هفته آینده به دلیل بازآرایی سالن، با یک هفته تأخیر برگزار می‌شود.",
      level: "warning",
      active: false,
      startsAt: iso,
      endsAt: null,
      createdAt: iso,
    },
  ];
}

function buildSettings(): SettingsRecord {
  return {
    officeName: SITE.name,
    slogan: SITE.slogan,
    phone1: SITE.phones[0].value,
    phone2: SITE.phones[1].value,
    email: SITE.email,
    address: SITE.addressFull,
    hoursSummary: SITE.hoursSummary,
    maxFileMb: 5,
    maxFiles: 4,
    allowedExtensions: ".pdf,.jpg,.jpeg,.png,.webp",
    autoReply: true,
    notifyEmail: true,
    notifySms: true,
    notifyTelegram: false,
    maintenance: false,
    weeklyReport: true,
    satisfactionSurvey: true,
    twoFactorForAdmins: false,
  };
}

export function buildSeed(now = new Date(FIXED_NOW)): AppState {
  const services = buildServices(now);
  const requests = buildRequests(services, now);
  const servicesWithCounts = services.map((s) => ({
    ...s,
    requestsCount: requests.filter((r) => r.serviceSlug === s.slug).length,
  }));
  return {
    version: 1,
    requests,
    services: servicesWithCounts,
    faqs: buildFaqs(now),
    articles: buildArticles(now),
    users: buildUsers(now),
    notifications: buildNotifications(requests, now),
    audit: buildAudit(requests, now),
    announcements: buildAnnouncements(now),
    settings: buildSettings(),
    session: { userId: "usr-0001", at: now.toISOString() },
    myRequests: [requests[7]?.trackingCode ?? "", requests[4]?.trackingCode ?? ""].filter(Boolean),
    hydratedAt: null,
  };
}

/* ------------------------------------------------------------------ *
 * مشتقات آماری
 * ------------------------------------------------------------------ */

export function buildStats(state: AppState, now = new Date()): import("./types").DashboardStats {
  const byStatus = {} as Record<RequestStatus, number>;
  (Object.keys((state as AppState).requests.reduce<Record<string, true>>((acc, r) => ({ ...acc, [r.status]: true }), {})) as RequestStatus[]).forEach(
    (s) => (byStatus[s] = 0),
  );
  for (const r of state.requests) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getTime() - (6 - i) * 86_400_000);
    const key = day.toISOString().slice(0, 10);
    return {
      date: key,
      label: formatDate(day, "short").split("/").slice(1).join("/"),
      count: state.requests.filter((r) => r.createdAt.slice(0, 10) === key).length,
    };
  });

  const byService = state.services.map((s) => ({
    slug: s.slug,
    title: s.title,
    count: state.requests.filter((r) => r.serviceSlug === s.slug).length,
    color: serviceColor(s.slug),
  }));

  const firstResponse: number[] = [];
  const completion: number[] = [];
  for (const r of state.requests) {
    const first = r.timeline.find((e) => e.status !== "new");
    if (first) firstResponse.push((new Date(first.at).getTime() - new Date(r.createdAt).getTime()) / 3_600_000);
    if (r.status === "completed") {
      const done = r.timeline[r.timeline.length - 1];
      completion.push((new Date(done.at).getTime() - new Date(r.createdAt).getTime()) / 3_600_000);
    }
  }
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const completed = state.requests.filter((r) => r.status === "completed").length;
  const ratings = state.requests.filter((r) => typeof r.rating === "number").map((r) => r.rating as number);

  return {
    total: state.requests.length,
    byStatus,
    last7Days,
    byService,
    avgFirstResponseHours: avg(firstResponse),
    avgCompletionHours: avg(completion),
    completionRate: state.requests.length ? (completed / state.requests.length) * 100 : 0,
    needsInfoRate: state.requests.length
      ? (state.requests.filter((r) => r.status === "needs_info").length / state.requests.length) * 100
      : 0,
    unreadNotifications: state.notifications.filter((n) => n.status === "queued").length,
    queuedNotifications: state.notifications.filter((n) => n.status === "queued" || n.status === "failed").length,
    activeUsers: state.users.filter((u) => u.active).length,
    attachments: state.requests.reduce((sum, r) => sum + r.attachments.length, 0),
    satisfaction: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
  };
}

const SERVICE_COLORS: Record<string, string> = {
  "health-card": "#14b8a6",
  "health-training": "#6366f1",
  "health-qualification": "#f59e0b",
  "audit-contracts": "#f43f5e",
  other: "#0ea5e9",
};

export function serviceColor(slug: string): string {
  return SERVICE_COLORS[slug] ?? "#64748b";
}

export function makeRequest(input: NewRequestInput, service: ServiceRecord, now = new Date()): RequestRecord {
  const iso = now.toISOString();
  return {
    id: `req-${now.getTime().toString(36)}`,
    trackingCode: randomTrackingCode(),
    serviceSlug: service.slug,
    serviceTitle: service.title,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    requesterType: input.requesterType,
    organization: input.organization,
    contactPreference: input.contactPreference,
    city: input.city,
    summary: input.summary,
    answers: input.answers,
    attachments: input.attachments,
    consent: input.consent,
    newsletter: input.newsletter,
    status: "new",
    priority: "normal",
    assignee: "",
    tags: [service.title],
    createdAt: iso,
    updatedAt: iso,
    dueAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    timeline: [
      {
        id: `ev-${now.getTime().toString(36)}`,
        at: iso,
        status: "new",
        note: "درخواست از طریق فرم آنلاین سایت ثبت شد.",
        actor: "سامانه",
        visibility: "public",
      },
    ],
    notes: [],
    source: "web",
  };
}
