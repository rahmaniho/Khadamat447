/** اعتبارسنجی سمت سرور (Zod) - تنها منبع حقیقت برای همه ورودی‌ها */
import { z } from "zod";
import { isAnyPhone, normalizePhone, toEnDigits } from "@/lib/utils";

/** حذف کاراکترهای کنترلی و یکسان‌سازی فاصله‌ها */
export function cleanText(input: unknown, max = 4000): string {
  const s = String(input ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
  return s.slice(0, max);
}

export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

export const loginSchema = z.object({
  email: z.string().trim().min(3, "ایمیل را وارد کنید.").max(160),
  password: z.string().min(1, "رمز عبور را وارد کنید.").max(200),
});

export const applicantSchema = z.object({
  clientSubmissionId: z.string().trim().min(8, "شناسه ارسال نامعتبر است.").max(64),
  serviceSlug: z.string().trim().min(1, "خدمت موردنظر را انتخاب کنید."),
  requesterType: z.enum(["person", "company"], { message: "نوع متقاضی را انتخاب کنید." }),
  fullName: z.string().trim().min(3, "نام و نام خانوادگی را کامل وارد کنید.").max(120, "نام بیش از حد طولانی است."),
  phone: z
    .string()
    .trim()
    .min(6, "شماره تماس را وارد کنید.")
    .max(20, "شماره تماس معتبر نیست.")
    .refine((v) => isAnyPhone(v), "شماره تماس معتبر نیست. مثال: ۰۹۱۲۱۲۳۴۵۶۷ یا ۰۲۸۳۳۹۹۲۵۵۰"),
  email: z.string().trim().max(160, "ایمیل بیش از حد طولانی است.").optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  orgName: z.string().trim().max(160).optional().or(z.literal("")),
  preferredContact: z.enum(["phone", "sms", "email"], { message: "روش ارتباطی را انتخاب کنید." }),
  message: z.string().trim().max(2000, "توضیحات بیش از ۲۰۰۰ نویسه است.").optional().or(z.literal("")),
  consentAccuracy: z.boolean(),
  consentPrivacy: z.boolean(),
  consentMarketing: z.boolean().optional(),
  fields: z.record(z.string(), z.string()).optional(),
});

export type ApplicantInput = z.infer<typeof applicantSchema>;

/** اعتبارسنجی مشروط: ایمیل تنها در صورت انتخاب روش ارتباطی ایمیل الزامی است */
export function validateApplicant(raw: unknown):
  | { ok: true; data: ApplicantInput & { phoneNormalized: string } }
  | { ok: false; errors: Record<string, string> } {
  const parsed = applicantSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  const data = parsed.data;
  const phoneNormalized = normalizePhone(data.phone);
  if (data.preferredContact === "email" && !isEmail(data.email || "")) {
    return { ok: false, errors: { email: "چون روش ارتباطی ایمیل را انتخاب کرده‌اید، واردکردن ایمیل معتبر الزامی است." } };
  }
  if (data.email && !isEmail(data.email)) {
    return { ok: false, errors: { email: "قالب ایمیل معتبر نیست." } };
  }
  if (!data.consentAccuracy) return { ok: false, errors: { consentAccuracy: "صحت اطلاعات واردشده را تأیید کنید." } };
  if (!data.consentPrivacy) return { ok: false, errors: { consentPrivacy: "پذیرش سیاست حفظ حریم خصوصی برای ثبت درخواست الزامی است." } };
  return { ok: true, data: { ...data, phoneNormalized } };
}

export interface ServiceFieldDef {
  id: string;
  field_key: string;
  label: string;
  type: string;
  options_json: string;
  required: number;
}

export interface ValidatedField {
  key: string;
  label: string;
  value: string;
  sortOrder: number;
}

/**
 * اعتبارسنجی فیلدهای اختصاصی هر خدمت
 * فقط کلیدهایی پذیرفته می‌شوند که در تعریف خدمت وجود دارند (جلوگیری از تزریق فیلد).
 */
export function validateServiceFields(
  definitions: ServiceFieldDef[],
  input: Record<string, unknown> | undefined,
): { ok: true; fields: ValidatedField[] } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const fields: ValidatedField[] = [];
  let order = 1;

  for (const def of definitions) {
    const raw = input?.[def.field_key];
    const value = cleanText(toEnDigits(String(raw ?? "")), 1000);
    const required = def.required === 1;
    if (required && !value) {
      errors[def.field_key] = `«${def.label}» الزامی است.`;
      continue;
    }
    if (!value) continue;
    if (def.type === "select" || def.type === "radio") {
      let options: string[] = [];
      try {
        options = JSON.parse(def.options_json || "[]");
      } catch {
        options = [];
      }
      if (options.length > 0 && !options.includes(value)) {
        errors[def.field_key] = `مقدار انتخاب‌شده برای «${def.label}» معتبر نیست.`;
        continue;
      }
    }
    if (def.type === "number" && value && !/^[0-9]{1,9}$/.test(value)) {
      errors[def.field_key] = `«${def.label}» باید یک عدد باشد.`;
      continue;
    }
    fields.push({ key: def.field_key, label: def.label, value, sortOrder: order++ });
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, fields };
}

/* --------------------------- فرم‌های پنل مدیریت --------------------------- */

export const statusUpdateSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["new", "pending_review", "needs_info", "in_review", "ready_to_report", "completed", "rejected"]),
  publicNote: z.string().trim().max(1500).optional().or(z.literal("")),
  internalNote: z.string().trim().max(2000).optional().or(z.literal("")),
  notifyApplicant: z.boolean().optional(),
});

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(5, "پرسش را وارد کنید.").max(300),
  answer: z.string().trim().min(5, "پاسخ را وارد کنید.").max(4000),
  serviceSlug: z.string().trim().max(80).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

export const articleSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(3).max(120),
  title: z.string().trim().min(5).max(200),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().trim().min(20, "متن مقاله بسیار کوتاه است.").max(60000),
  author: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  relatedServices: z.array(z.string()).optional(),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  tagline: z.string().trim().max(240).optional().or(z.literal("")),
  summary: z.string().trim().max(600).optional().or(z.literal("")),
  intro: z.string().trim().max(20000).optional().or(z.literal("")),
  audience: z.string().trim().max(20000).optional().or(z.literal("")),
  process: z.string().trim().max(20000).optional().or(z.literal("")),
  documents: z.string().trim().max(20000).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  active: z.boolean().optional(),
  allowAttachments: z.boolean().optional(),
  maxAttachments: z.coerce.number().int().min(0).max(10).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  markReviewed: z.boolean().optional(),
});

export const serviceFieldSchema = z.object({
  serviceId: z.string().min(1),
  id: z.string().optional(),
  fieldKey: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{1,40}$/, "کلید فیلد باید با حروف کوچک انگلیسی و بدون فاصله باشد."),
  label: z.string().trim().min(2).max(120),
  type: z.enum(["text", "textarea", "select", "radio", "number", "date", "tel", "email"]),
  options: z.array(z.string().trim().max(120)).optional(),
  placeholder: z.string().trim().max(160).optional().or(z.literal("")),
  helpText: z.string().trim().max(300).optional().or(z.literal("")),
  required: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email("ایمیل معتبر نیست."),
  password: z.string().min(10, "رمز عبور باید حداقل ۱۰ نویسه باشد.").max(200).optional().or(z.literal("")),
  role: z.enum(["owner", "reviewer", "content"]),
  active: z.boolean().optional(),
});

export const settingsSchema = z.record(z.string(), z.string().max(20000));

export const trackingSchema = z.object({
  trackingCode: z.string().trim().min(4, "کد پیگیری را وارد کنید.").max(40),
  verification: z
    .string()
    .trim()
    .min(4, "چهار رقم آخر شماره تماس را وارد کنید.")
    .max(20)
    .refine((v) => /^[0-9۰-۹٠-٩\s-]{4,}$/.test(v), "چهار رقم آخر شماره تماس را وارد کنید."),
});

export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().max(2000).optional().or(z.literal("")),
  kind: z.enum(["info", "warning", "success"]).optional(),
  active: z.boolean().optional(),
  startsAt: z.string().trim().max(40).optional().or(z.literal("")),
  endsAt: z.string().trim().max(40).optional().or(z.literal("")),
});
