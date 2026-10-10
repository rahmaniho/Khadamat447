/**
 * فهرست کلیدهای قابل ویرایش از پنل مدیریت (whitelist).
 * هر کلید فقط از این فهرست ذخیره می‌شود؛ کلیدهای محرمانه (ایمیل‌ها، رمزها) در اینجا نیستند.
 */
export type SettingKind = "text" | "textarea" | "markdown" | "json" | "url" | "tel" | "number" | "decimal" | "extensions";

export interface SettingField {
  key: string;
  label: string;
  kind: SettingKind;
  help?: string;
  max?: number;
}

export interface SettingGroup {
  id: string;
  title: string;
  desc: string;
  fields: SettingField[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "site",
    title: "هویت و معرفی",
    desc: "نام، شعار و توضیحات کوتاه دفتر که در سراسر سایت نمایش داده می‌شود.",
    fields: [
      { key: "site.name", label: "نام کامل دفتر", kind: "text", max: 120 },
      { key: "site.short_name", label: "نام کوتاه", kind: "text", max: 60 },
      { key: "site.slogan", label: "شعار", kind: "text", max: 160 },
      { key: "site.description", label: "توضیح کوتاه (متا)", kind: "textarea", max: 320 },
      { key: "site.city", label: "شهر", kind: "text", max: 60 },
    ],
  },
  {
    id: "business",
    title: "نشانی، تماس و ساعات کاری",
    desc: "اطلاعات تماس و موقعیت دفتر. تغییر در این بخش در فوتر، صفحه تماس، نقشه و داده‌های ساختاریافته اعمال می‌شود.",
    fields: [
      { key: "business.address", label: "نشانی کوتاه", kind: "text", max: 200 },
      { key: "business.address_full", label: "نشانی کامل", kind: "text", max: 300 },
      { key: "business.lat", label: "عرض جغرافیایی (Latitude)", kind: "decimal", help: "مثال: 36.2678594" },
      { key: "business.lng", label: "طول جغرافیایی (Longitude)", kind: "decimal", help: "مثال: 50.0135519" },
      { key: "business.map_url", label: "لینک Google Maps", kind: "url", help: "لینک مسیریابی؛ باید با https:// شروع شود." },
      { key: "business.map_profile_url", label: "لینک پروفایل رسمی در سرویس‌های نقشه (اختیاری)", kind: "url" },
      { key: "business.phone_1", label: "شماره تماس اول", kind: "tel", help: "مثال: 09398520150" },
      { key: "business.phone_2", label: "شماره تماس دوم", kind: "tel", help: "مثال: 02833992550" },
      {
        key: "business.hours_json",
        label: "ساعات کاری (JSON)",
        kind: "json",
        help: 'فرمت: [{"day":"شنبه تا چهارشنبه","hours":"۰۸:۰۰ تا ۱۶:۰۰","closed":false}]. خالی بگذارید اگر ساعات کاری رسمی هنوز اعلام نشده است.',
      },
      {
        key: "business.social_json",
        label: "شبکه‌های اجتماعی (JSON)",
        kind: "json",
        help: 'فرمت: [{"label":"نام","url":"https://..."}]. فقط آدرس‌های https پذیرفته می‌شوند.',
      },
    ],
  },
  {
    id: "seo",
    title: "سئو",
    desc: "عنوان و توضیحات متا صفحه اصلی و نشانی عمومی سایت.",
    fields: [
      { key: "seo.home_title", label: "عنوان صفحه اصلی", kind: "text", max: 160 },
      { key: "seo.home_description", label: "توضیحات متا صفحه اصلی", kind: "textarea", max: 320 },
      { key: "seo.site_url", label: "نشانی عمومی سایت (اگر متغیر محیطی تنظیم نشده)", kind: "url", help: "مثال: https://example.ir — برای canonical و sitemap." },
    ],
  },
  {
    id: "notify",
    title: "متن اعلان‌ها",
    desc: "متن ایمیل‌ها و پیام تلگرام. متغیرها: {tracking_code} {service} {created_at} {status} {public_note} {site_name}. هرگز اطلاعات حساس یا مدرک در متن قرار ندهید.",
    fields: [
      { key: "notify.admin_email_subject", label: "موضوع ایمیل مدیر", kind: "text", max: 200 },
      { key: "notify.admin_email_body", label: "متن ایمیل مدیر", kind: "textarea", max: 2000 },
      { key: "notify.applicant_email_subject", label: "موضوع تأیید به متقاضی", kind: "text", max: 200 },
      { key: "notify.applicant_email_body", label: "متن تأیید به متقاضی", kind: "textarea", max: 2000 },
      { key: "notify.status_change_subject", label: "موضوع اعلان تغییر وضعیت", kind: "text", max: 200 },
      { key: "notify.status_change_body", label: "متن اعلان تغییر وضعیت", kind: "textarea", max: 2000 },
      { key: "notify.telegram_template", label: "متن پیام تلگرام (کوتاه)", kind: "textarea", max: 500 },
    ],
  },
  {
    id: "form",
    title: "فرم و بارگذاری مدارک",
    desc: "محدودیت‌های فایل. فقط قالب‌های امن (PDF و تصویر) قابل انتخاب هستند.",
    fields: [
      { key: "form.max_file_mb", label: "حداکثر حجم هر فایل (مگابایت)", kind: "number", help: "عدد بین ۱ تا ۲۰" },
      { key: "form.max_files_per_request", label: "حداکثر تعداد فایل در هر درخواست", kind: "number", help: "عدد بین ۱ تا ۱۰" },
      { key: "form.allowed_extensions", label: "قالب‌های مجاز", kind: "extensions", help: "از میان .pdf، .jpg، .jpeg، .png، .webp" },
    ],
  },
  {
    id: "policy",
    title: "حریم خصوصی و مقررات",
    desc: "متن‌های حقوقی. پیش از انتشار باید توسط مرجع ذی‌صلاح بررسی شوند.",
    fields: [
      { key: "policy.retention_days", label: "مدت نگهداری اطلاعات (روز)", kind: "number", help: "پس از تعیین توسط دفتر و بررسی حقوقی وارد کنید؛ خالی بماند تا تعیین نشده نمایش داده شود." },
      { key: "policy.consent_text", label: "متن رضایت آگاهانه", kind: "textarea", max: 600 },
      { key: "policy.data_disclaimer", label: "هشدار: ثبت به معنی تأیید نیست", kind: "textarea", max: 600 },
      { key: "policy.privacy_md", label: "سیاست حفظ حریم خصوصی (Markdown)", kind: "markdown", max: 20000 },
      { key: "policy.terms_md", label: "قوانین و مقررات (Markdown)", kind: "markdown", max: 20000 },
    ],
  },
  {
    id: "content",
    title: "محتوای عمومی",
    desc: "متن صفحه «درباره ما» و پابرگ.",
    fields: [
      { key: "content.about_md", label: "صفحه درباره ما (Markdown)", kind: "markdown", max: 20000 },
      { key: "content.footer_note", label: "یادداشت پابرگ (اختیاری)", kind: "textarea", max: 300 },
    ],
  },
];

export const ALLOWED_SETTING_KEYS = new Set(SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key)));
