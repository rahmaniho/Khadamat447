/** وضعیت‌های درخواست */
export const REQUEST_STATUSES = {
  new: { label: "ثبت اولیه", tone: "sky", description: "درخواست ثبت شده و هنوز بررسی نشده است." },
  pending_review: { label: "در انتظار بررسی", tone: "amber", description: "درخواست در صف بررسی کارشناس است." },
  needs_info: { label: "نیازمند تکمیل اطلاعات", tone: "orange", description: "برای ادامه، اطلاعات یا مدارک بیشتری لازم است." },
  in_review: { label: "در حال بررسی", tone: "indigo", description: "بررسی درخواست آغاز شده است." },
  ready_to_report: { label: "آماده اعلام نتیجه", tone: "violet", description: "بررسی انجام شده و نتیجه آماده اعلام است." },
  completed: { label: "تکمیل‌شده", tone: "emerald", description: "فرایند رسیدگی به این درخواست پایان یافته است." },
  rejected: { label: "ردشده", tone: "rose", description: "درخواست بر اساس بررسی انجام‌شده قابل پذیرش نبود." },
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUSES;
export const REQUEST_STATUS_KEYS = Object.keys(REQUEST_STATUSES) as RequestStatus[];

/** نقش‌های کاربران پنل مدیریت */
export const ROLES = {
  owner: { label: "مدیر کل", description: "دسترسی کامل به همه بخش‌ها" },
  reviewer: { label: "کارمند بررسی درخواست", description: "مدیریت درخواست‌ها و مدارک" },
  content: { label: "مدیر محتوا", description: "مدیریت خدمات، مقالات، سؤالات و تنظیمات سایت" },
} as const;

export type Role = keyof typeof ROLES;
export const ROLE_KEYS = Object.keys(ROLES) as Role[];

/** ماتریس دسترسی مبتنی بر نقش */
export const PERMISSIONS = {
  "dashboard.view": ["owner", "reviewer", "content"],
  "requests.view": ["owner", "reviewer"],
  "requests.manage": ["owner", "reviewer"],
  "requests.delete": ["owner"],
  "requests.export": ["owner"],
  "attachments.view": ["owner", "reviewer"],
  "attachments.manage": ["owner", "reviewer"],
  "content.services": ["owner", "content"],
  "content.faqs": ["owner", "content"],
  "content.articles": ["owner", "content"],
  "content.settings": ["owner", "content"],
  "content.announcements": ["owner", "content"],
  "users.manage": ["owner"],
  "logs.view": ["owner"],
  "notifications.view": ["owner", "reviewer"],
  "notifications.retry": ["owner", "reviewer"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: Role | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

/** روش‌های ترجیحی ارتباط */
export const CONTACT_PREFERENCES = {
  phone: "تماس تلفنی",
  sms: "پیامک (شماره ثبت‌شده)",
  email: "ایمیل",
} as const;

/** انواع متقاضی */
export const REQUESTER_TYPES = {
  person: "شخص حقیقی",
  company: "شخص حقوقی / واحد صنفی",
} as const;

/** نوع فایل‌های مجاز برای بارگذاری مدارک */
export const DEFAULT_ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

/** اندازه پیش‌فرض مجاز هر فایل: ۵ مگابایت */
export const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;
