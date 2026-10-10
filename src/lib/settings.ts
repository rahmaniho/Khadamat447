/**
 * تنظیمات مرکزی سایت
 * ---------------------------------------------------------------
 * همه اطلاعات کسب‌وکار (نشانی، شماره‌ها، ساعات کاری، خدمات، متن اعلان‌ها و ...)
 * در جدول settings ذخیره می‌شود و از پنل مدیریت قابل ویرایش است.
 * مقادیر محرمانه (نشانی ایمیل‌ها و کلیدها) فقط از متغیرهای محیطی خوانده می‌شوند.
 */
import { all, run, nowIso } from "@/lib/db";

export type SettingsMap = Record<string, string>;

/** ساعات کاری اعلام‌شده (۸ تا ۱۶) */
export const HOURS_DEFAULT_JSON = JSON.stringify([
  { day: "ساعات کاری دفتر", hours: "۰۸:۰۰ تا ۱۶:۰۰", closed: false },
]);

/** دامنه پیشنهادی سایت بر اساس دامنه ایمیل رسمی دفتر */
export const SITE_URL_DEFAULT = "https://khadamat447.ir";

/** ایمیل رسمی دفتر (اعلام‌شده توسط دفتر). با متغیرهای محیطی قابل بازنویسی است. */
export const OFFICE_EMAIL_DEFAULT = "Info@Khadamat447.IR";

/** مقدارهای پیش‌فرض - بدون هیچ داده ساختگی (ایمیل‌ها خالی و از env خوانده می‌شوند) */
export const SETTING_DEFAULTS: SettingsMap = {
  "site.name": "دفتر خدمات سلامت ۴۷۷",
  "site.short_name": "خدمات سلامت ۴۷۷",
  "site.slogan": "ارائه خدمات سلامت، بهداشت و ایمنی برای جامعه سالم‌تر",
  "site.description":
    "معرفی خدمات دفتر خدمات سلامت ۴۷۷ در قزوین؛ مشاهده خدمات کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی، همراه با ثبت درخواست آنلاین و راهنمای موقعیت دفتر.",
  "site.city": "قزوین",
  "site.province": "قزوین",

  "business.address": "خیابان طالقانی، برج خلیج فارس، طبقه ششم، واحد ۶۱۹",
  "business.address_full": "قزوین، خیابان طالقانی، برج خلیج فارس، طبقه ششم، واحد ۶۱۹",
  "business.lat": "36.2678594",
  "business.lng": "50.0135519",
  "business.map_url": "https://www.google.com/maps?q=36.2678594,50.0135519",
  "business.map_profile_url": "",
  "business.phone_1": "09398520150",
  "business.phone_2": "02833992550",
  // ساعات کاری اعلام‌شده توسط دفتر: ۸ صبح تا ۱۶. فهرست روزهای کاری هنوز تأیید نشده و از پنل مدیریت قابل ویرایش است.
  "business.hours_json": HOURS_DEFAULT_JSON,
  "business.social_json": "[]",

  // دامنه سایت؛ با متغیر NEXT_PUBLIC_SITE_URL قابل بازنویسی است.
  "seo.site_url": SITE_URL_DEFAULT,
  "seo.home_title": "دفتر خدمات سلامت ۴۷۷ قزوین | ثبت درخواست آنلاین",
  "seo.home_description":
    "معرفی خدمات دفتر خدمات سلامت ۴۷۷ در قزوین؛ مشاهده خدمات کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی، همراه با ثبت درخواست آنلاین و راهنمای موقعیت دفتر.",

  "notify.admin_email_subject": "درخواست جدید در دفتر خدمات سلامت ۴۷۷",
  "notify.admin_email_body":
    "یک درخواست جدید از طریق وب‌سایت ثبت شده است.\n\nکد پیگیری: {tracking_code}\nنوع خدمت: {service}\nزمان ثبت: {created_at}\n\nبرای مشاهده جزئیات، وارد پنل مدیریت شوید.",
  "notify.applicant_email_subject": "تأیید ثبت درخواست شما",
  "notify.applicant_email_body":
    "درخواست شما در سامانه دفتر خدمات سلامت ۴۷۷ ثبت شد.\n\nکد پیگیری: {tracking_code}\n\nثبت درخواست به معنی تأیید نهایی یا صدور مجوز نیست. برای اطلاع از وضعیت درخواست، از صفحه پیگیری سایت استفاده کنید.",
  "notify.telegram_template":
    "📥 درخواست جدید | خدمت: {service} | کد پیگیری: {tracking_code} | زمان: {created_at}",
  "notify.status_change_subject": "به‌روزرسانی وضعیت درخواست شما",
  "notify.status_change_body":
    "وضعیت درخواست شما با کد پیگیری {tracking_code} در سامانه دفتر خدمات سلامت ۴۷۷ به «{status}» تغییر کرد.\n\n{public_note}\n\nثبت درخواست به معنی تأیید نهایی یا صدور مجوز نیست.",

  // مدت نگهداری باید پس از بررسی حقوقی تعیین شود؛ تا آن زمان خالی است.
  "policy.retention_days": "",
  "policy.consent_text":
    "اطلاعات ارسال‌شده صرفاً برای رسیدگی به همین درخواست استفاده می‌شود و در اختیار اشخاص ثالث قرار نمی‌گیرد.",
  "policy.data_disclaimer":
    "ثبت درخواست در این سامانه به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست؛ نتیجه پس از بررسی کارشناسی از طریق کانال ارتباطی انتخابی شما اعلام می‌شود.",

  "form.max_file_mb": "5",
  "form.allowed_extensions": ".pdf,.jpg,.jpeg,.png,.webp",
  "form.max_files_per_request": "4",



  "content.footer_note": "",
  "policy.privacy_md":
    "## اطلاعاتی که جمع‌آوری می‌شود\n\nفقط اطلاعاتی که برای رسیدگی به درخواست لازم است دریافت می‌شود: نام، شماره تماس، روش ارتباطی ترجیحی، و اطلاعات مربوط به خدمت درخواستی. ایمیل اختیاری است.\n\nکد ملی، اطلاعات پزشکی و سایر داده‌های حساس به‌صورت پیش‌فرض دریافت نمی‌شود.\n\n## هدف استفاده\n\nاطلاعات فقط برای رسیدگی به همان درخواست و اطلاع‌رسانی وضعیت آن استفاده می‌شود و برای بازاریابی یا در اختیار اشخاص ثالث قرار نمی‌گیرد.\n\n## مدارک بارگذاری‌شده\n\nمدارک در فضای ذخیره‌سازی خصوصی نگهداری می‌شوند، از پوشه عمومی سایت جدا هستند و فقط کارکنان مجاز می‌توانند آن‌ها را ببینند. دسترسی به مدارک ثبت می‌شود. مدارک هرگز از طریق ایمیل ارسال نمی‌شوند.\n\n## مدت نگهداری و حذف\n\nمدت نگهداری اطلاعات پس از بررسی حقوقی و تعیین توسط دفتر اعلام می‌شود. برای درخواست حذف یا دریافت نسخه‌ای از اطلاعات خود، با شماره‌های تماس دفتر هماهنگ کنید.\n\n## پیام‌های اطلاع‌رسانی\n\nپیام‌های عمومی دفتر تنها با رضایت جداگانه و اختیاری شما ارسال می‌شود.",
  "policy.terms_md":
    "## استفاده از سایت\n\nاین سایت برای معرفی خدمات دفتر خدمات سلامت ۴۷۷ و دریافت درخواست‌های آنلاین ایجاد شده است.\n\n## ماهیت ثبت درخواست\n\nثبت درخواست آنلاین به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست. نتیجه هر درخواست پس از بررسی و طی مراحل قانونی اعلام می‌شود.\n\n## صحت اطلاعات\n\nمسئولیت صحت اطلاعات و مدارک ارسالی بر عهده متقاضی است.\n\n## محتوای آموزشی\n\nمطالب آموزشی سایت جایگزین مقررات رسمی یا تصمیم مراجع ذی‌صلاح نیست.\n\n## تغییرات\n\nدفتر می‌تواند متن این قوانین و خدمات را به‌روزرسانی کند.",
  "content.about_md":
    "## دفتر خدمات سلامت ۴۷۷ قزوین\n\nدفتر خدمات سلامت ۴۷۷ در قزوین، ثبت و پیگیری درخواست‌های مربوط به خدمات سلامت و بهداشت را برای شاغلان و واحدهای صنفی فراهم می‌کند.\n\nهدف ما این است که مسیر درخواست‌ها شفاف، قابل پیگیری و ساده باشد. اطلاعات این صفحه از تنظیمات مرکزی سامانه خوانده می‌شود و از پنل مدیریت قابل ویرایش است.\n\n## ارزش‌های ما\n\n- **شفافیت:** وضعیت هر درخواست با کد پیگیری قابل دنبال‌کردن است.\n- **حریم خصوصی:** اطلاعات تنها برای رسیدگی به همان درخواست استفاده می‌شود.\n- **دسترسی:** فرم‌ها برای استفاده در موبایل طراحی شده‌اند.",
};

/** کلیدهایی که فقط از متغیرهای محیطی خوانده می‌شوند (هرگز در DB یا UI عمومی) */
export const envOnly = {
  adminEmail: () => (process.env.ADMIN_NOTIFICATION_EMAIL || "").trim() || OFFICE_EMAIL_DEFAULT,
  mailFrom: () => (process.env.MAIL_FROM || "").trim(),
  publicEmail: () => (process.env.PUBLIC_CONTACT_EMAIL || "").trim() || OFFICE_EMAIL_DEFAULT,
  siteUrl: () => (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, ""),
};

let cache: { at: number; map: SettingsMap } | null = null;
const CACHE_TTL_MS = 15_000;

export async function getSettings(): Promise<SettingsMap> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.map;
  const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map: SettingsMap = { ...SETTING_DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  cache = { at: Date.now(), map };
  return map;
}

export async function getSetting(key: string): Promise<string> {
  const map = await getSettings();
  return map[key] ?? SETTING_DEFAULTS[key] ?? "";
}

export function invalidateSettingsCache(): void {
  cache = null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await run(
    "INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    [key, value, nowIso()],
  );
  invalidateSettingsCache();
}

export async function setSettings(entries: Record<string, string>): Promise<void> {
  for (const [k, v] of Object.entries(entries)) {
    await run(
      "INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      [k, v, nowIso()],
    );
  }
  invalidateSettingsCache();
}

/** تنظیمات عمومی و تایپ‌شده برای استفاده در رابط کاربری */
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

export async function getSiteConfig(): Promise<PublicSiteConfig> {
  const s = await getSettings();
  const hours = (() => {
    try {
      return JSON.parse(s["business.hours_json"] || "[]");
    } catch {
      return [];
    }
  })();
  const social = (() => {
    try {
      return JSON.parse(s["business.social_json"] || "[]");
    } catch {
      return [];
    }
  })();
  return {
    name: s["site.name"],
    shortName: s["site.short_name"],
    slogan: s["site.slogan"],
    description: s["site.description"],
    city: s["site.city"],
    province: s["site.province"],
    address: s["business.address"],
    addressFull: s["business.address_full"],
    lat: Number(s["business.lat"]) || 36.2678594,
    lng: Number(s["business.lng"]) || 50.0135519,
    mapUrl: s["business.map_url"],
    mapProfileUrl: s["business.map_profile_url"],
    phone1: s["business.phone_1"],
    phone2: s["business.phone_2"],
    hours,
    social,
    publicEmail: envOnly.publicEmail(),
    siteUrl: envOnly.siteUrl() || s["seo.site_url"] || "",
    homeTitle: s["seo.home_title"],
    homeDescription: s["seo.home_description"],
    dataDisclaimer: s["policy.data_disclaimer"],
    footerNote: s["content.footer_note"],
    retentionDays: s["policy.retention_days"],
    privacyMd: s["policy.privacy_md"],
    termsMd: s["policy.terms_md"],
    aboutMd: s["content.about_md"],
  };
}

/** اطمینان از وجود کلیدهای پیش‌فرض در جدول settings (بدون بازنویسی مقادیر ویرایش‌شده) */
export async function ensureSettingsSeeded(): Promise<void> {
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await run(
      "INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO NOTHING",
      [key, value, nowIso()],
    );
  }
  // انتقال یک‌باره: پایگاه‌داده‌های قدیمی که هنوز مقدار خالی/پیش‌فرض قبلی دارند،
  // مقدار جدید ساعات کاری و دامنه را دریافت می‌کنند. مقادیری که مدیر ویرایش کرده، دست‌نخورده می‌ماند.
  const migrations: Array<[string, string, string]> = [
    ["business.hours_json", "[]", HOURS_DEFAULT_JSON],
    ["seo.site_url", "", SITE_URL_DEFAULT],
  ];
  for (const [key, from, to] of migrations) {
    await run("UPDATE settings SET value = ?, updated_at = ? WHERE key = ? AND value = ?", [to, nowIso(), key, from]);
  }
  invalidateSettingsCache();
}
