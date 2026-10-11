/**
 * مدل‌های داده سامانه (نسخه نمایشی مرورگر)
 * ---------------------------------------------------------------
 * ساختارها مطابق طرح پایگاه داده سامانه اصلی طراحی شده‌اند تا انتقال
 * منطق دامنه به سرور و PostgreSQL بدون تغییر رابط کاربری ممکن باشد.
 */

export type RequestStatus =
  | "new"
  | "pending_review"
  | "needs_info"
  | "in_review"
  | "ready_to_report"
  | "completed"
  | "rejected";

export type Priority = "low" | "normal" | "high" | "urgent";
export type Role = "owner" | "reviewer" | "content" | "support";
export type Channel = "email" | "sms" | "telegram" | "phone";
export type EventVisibility = "public" | "internal";

export interface StatusMeta {
  label: string;
  tone: string;
  description: string;
  step: number;
  color: string;
}

export const STATUS_META: Record<RequestStatus, StatusMeta> = {
  new: {
    label: "ثبت‌شده",
    tone: "sky",
    description: "درخواست ثبت شده و در انتظار تخصیص است.",
    step: 1,
    color: "#0ea5e9",
  },
  pending_review: {
    label: "در انتظار بررسی",
    tone: "amber",
    description: "درخواست در صف بررسی کارشناس قرار گرفته است.",
    step: 2,
    color: "#f59e0b",
  },
  needs_info: {
    label: "نیازمند تکمیل",
    tone: "orange",
    description: "اطلاعات یا مدارک بیشتری برای ادامه لازم است.",
    step: 3,
    color: "#f97316",
  },
  in_review: {
    label: "در حال بررسی",
    tone: "indigo",
    description: "بررسی کارشناسی درخواست آغاز شده است.",
    step: 4,
    color: "#6366f1",
  },
  ready_to_report: {
    label: "آماده اعلام نتیجه",
    tone: "violet",
    description: "بررسی انجام شده و نتیجه در حال آماده‌سازی است.",
    step: 5,
    color: "#8b5cf6",
  },
  completed: {
    label: "تکمیل‌شده",
    tone: "emerald",
    description: "فرایند رسیدگی به این درخواست پایان یافته است.",
    step: 6,
    color: "#10b981",
  },
  rejected: {
    label: "ردشده",
    tone: "rose",
    description: "درخواست بر اساس بررسی انجام‌شده قابل پذیرش نبود.",
    step: 6,
    color: "#f43f5e",
  },
};

export const STATUS_ORDER: RequestStatus[] = [
  "new",
  "pending_review",
  "needs_info",
  "in_review",
  "ready_to_report",
  "completed",
];

export const PRIORITY_META: Record<Priority, { label: string; tone: string; color: string }> = {
  low: { label: "کم", tone: "slate", color: "#94a3b8" },
  normal: { label: "عادی", tone: "sky", color: "#0ea5e9" },
  high: { label: "بالا", tone: "amber", color: "#f59e0b" },
  urgent: { label: "فوری", tone: "rose", color: "#f43f5e" },
};

export const CHANNEL_META: Record<Channel, { label: string; icon: string; tone: string }> = {
  email: { label: "ایمیل", icon: "mail", tone: "info" },
  sms: { label: "پیامک", icon: "phone", tone: "emerald" },
  telegram: { label: "تلگرام", icon: "telegram", tone: "sky" },
  phone: { label: "تماس تلفنی", icon: "chat", tone: "gold" },
};

export const ROLE_META: Record<Role, { label: string; description: string; tone: string }> = {
  owner: { label: "مدیر کل", description: "دسترسی کامل به همه بخش‌ها و تنظیمات", tone: "gold" },
  reviewer: { label: "کارشناس بررسی", description: "مدیریت درخواست‌ها، مدارک و اعلان‌ها", tone: "brand" },
  content: { label: "مدیر محتوا", description: "خدمات، مقالات، پرسش‌ها و تنظیمات سایت", tone: "info" },
  support: { label: "پشتیبانی", description: "مشاهده درخواست‌ها و پاسخ به پرسش‌ها", tone: "slate" },
};

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  ext: string;
  uploadedAt: string;
  /** پیش‌نمایش تصویر کوچک (فقط برای فایل‌های کم‌حجم) */
  preview?: string;
  verified: boolean;
}

export interface StatusEvent {
  id: string;
  at: string;
  status: RequestStatus;
  note: string;
  actor: string;
  visibility: EventVisibility;
  channel?: Channel;
}

export interface InternalNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface RequestRecord {
  id: string;
  trackingCode: string;
  serviceSlug: string;
  serviceTitle: string;
  fullName: string;
  phone: string;
  email: string;
  requesterType: "person" | "company";
  organization: string;
  contactPreference: Channel;
  city: string;
  summary: string;
  answers: Array<{ key: string; label: string; value: string }>;
  attachments: Attachment[];
  consent: boolean;
  newsletter: boolean;
  status: RequestStatus;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  timeline: StatusEvent[];
  notes: InternalNote[];
  rating?: number;
  source: "web" | "phone" | "referral";
}

export interface ServiceField {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date" | "tel" | "email" | "checkbox";
  options?: string[];
  placeholder?: string;
  help?: string;
  required: boolean;
  group: "applicant" | "service" | "extra";
}

export interface ServiceRecord {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  icon: string;
  emoji: string;
  gradient: string;
  accent: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  maxAttachments: number;
  duration: string;
  audience: string;
  highlights: string[];
  deliverables: string[];
  tags: string[];
  popular: boolean;
  fields: ServiceField[];
  updatedAt: string;
  requestsCount: number;
}

export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  serviceSlug: string | null;
  published: boolean;
  pinned: boolean;
  views: number;
  helpful: number;
  updatedAt: string;
}

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover: string;
  author: string;
  status: "draft" | "review" | "published";
  relatedServices: string[];
  tags: string[];
  readMinutes: number;
  views: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  avatarColor: string;
  lastLoginAt: string | null;
  createdAt: string;
  permissionsOverride?: string[];
}

export interface NotificationRecord {
  id: string;
  channel: Channel;
  recipient: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "failed" | "opened";
  attempts: number;
  requestId: string | null;
  trackingCode: string | null;
  createdAt: string;
  sentAt: string | null;
  error: string | null;
}

export interface AuditRecord {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  level: "info" | "success" | "warning" | "danger";
  active: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export interface SettingsRecord {
  officeName: string;
  slogan: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  hoursSummary: string;
  maxFileMb: number;
  maxFiles: number;
  allowedExtensions: string;
  autoReply: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyTelegram: boolean;
  maintenance: boolean;
  weeklyReport: boolean;
  satisfactionSurvey: boolean;
  twoFactorForAdmins: boolean;
}

export interface AppState {
  version: number;
  requests: RequestRecord[];
  services: ServiceRecord[];
  faqs: FaqRecord[];
  articles: ArticleRecord[];
  users: UserRecord[];
  notifications: NotificationRecord[];
  audit: AuditRecord[];
  announcements: AnnouncementRecord[];
  settings: SettingsRecord;
  session: { userId: string; at: string } | null;
  myRequests: string[];
  hydratedAt: string | null;
}

export interface NewRequestInput {
  serviceSlug: string;
  fullName: string;
  phone: string;
  email: string;
  requesterType: "person" | "company";
  organization: string;
  contactPreference: Channel;
  city: string;
  summary: string;
  answers: Array<{ key: string; label: string; value: string }>;
  attachments: Attachment[];
  consent: boolean;
  newsletter: boolean;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
  last7Days: Array<{ date: string; label: string; count: number }>;
  byService: Array<{ slug: string; title: string; count: number; color: string }>;
  avgFirstResponseHours: number;
  avgCompletionHours: number;
  completionRate: number;
  needsInfoRate: number;
  unreadNotifications: number;
  queuedNotifications: number;
  activeUsers: number;
  attachments: number;
  satisfaction: number | null;
}
