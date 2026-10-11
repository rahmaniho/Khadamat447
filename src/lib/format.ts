/**
 * قالب‌بندی اعداد، تاریخ شمسی و زمان — سازگار با سرور و مرورگر
 * ---------------------------------------------------------------
 * همه توابع این فایل «خالص» هستند و به API مرورگر وابسته نیستند تا
 * خروجی رندر سروری و مرورگری یکسان باشد (بدون اختلاف هیدریشن).
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام لاتین به فارسی */
export function fa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به لاتین (برای پردازش ورودی کاربر) */
export function en(input: string): string {
  return String(input ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** عدد با جداکننده هزارگان فارسی */
export function faNumber(value: number, fractionDigits = 0): string {
  const fixed = Number.isFinite(value) ? value.toFixed(fractionDigits) : "0";
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return fa(dec ? `${grouped}.${dec}` : grouped);
}

export function faPercent(value: number, fractionDigits = 0): string {
  return `${faNumber(value, fractionDigits)}٪`;
}

export function faBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / 1024 ** i;
  return `${faNumber(v, i === 0 ? 0 : 1)} ${units[i]}`;
}

/* ------------------------------------------------------------------ *
 * تاریخ شمسی
 * ------------------------------------------------------------------ */

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

const TEHRAN_TZ = "Asia/Tehran";

type Parts = { y: number; m: number; d: number; hh: number; mm: number; ss: number; weekday: number };

function partsIn(timeZone: string, date: Date): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  const wd: Record<string, number> = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };
  const hour = Number(map.hour) % 24;
  return {
    y: Number(map.year),
    m: Number(map.month),
    d: Number(map.day),
    hh: hour,
    mm: Number(map.minute),
    ss: Number(map.second),
    weekday: wd[map.weekday] ?? 0,
  };
}

/** تبدیل تاریخ میلادی به شمسی (الگوریتم استاندارد، بدون وابستگی) */
export function g2j(gy: number, gm: number, gd: number): [number, number, number] {
  const gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) + gd + gDaysInMonth[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

function jalaliParts(date: Date, timeZone = TEHRAN_TZ) {
  const p = partsIn(timeZone, date);
  const [jy, jm, jd] = g2j(p.y, p.m, p.d);
  return { ...p, jy, jm, jd };
}

export type DateStyle = "full" | "long" | "medium" | "short" | "day" | "time" | "datetime";

/** نمایش تاریخ به شمسی. مثال: «۱۹ مهر ۱۴۰۴» */
export function formatDate(input?: string | number | Date | null, style: DateStyle = "medium"): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  const { jy, jm, jd, hh, mm, weekday } = jalaliParts(date);
  const day = WEEKDAYS[weekday];
  const clock = fa(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  const long = `${fa(jd)} ${JALALI_MONTHS[jm - 1]} ${fa(jy)}`;
  switch (style) {
    case "full":
      return `${day}، ${long} — ساعت ${clock}`;
    case "long":
      return `${day} ${long}`;
    case "medium":
      return long;
    case "short":
      return fa(`${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`);
    case "day":
      return long;
    case "time":
      return clock;
    case "datetime":
      return `${long} — ${clock}`;
    default:
      return long;
  }
}

export function faDate(input?: string | number | Date | null): string {
  return formatDate(input, "medium");
}

export function faDateTime(input?: string | number | Date | null): string {
  return formatDate(input, "datetime");
}

/** بازه زمانی نسبی: «۳ ساعت پیش» */
export function timeAgo(input?: string | number | Date | null, now?: Date): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  const base = now ? now.getTime() : Date.now();
  const diff = base - date.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  let value: number;
  let unit: string;
  if (abs < minute) return future ? "چند لحظه دیگر" : "همین حالا";
  else if (abs < hour) [value, unit] = [Math.round(abs / minute), "دقیقه"];
  else if (abs < day) [value, unit] = [Math.round(abs / hour), "ساعت"];
  else if (abs < month) [value, unit] = [Math.round(abs / day), "روز"];
  else if (abs < year) [value, unit] = [Math.round(abs / month), "ماه"];
  else [value, unit] = [Math.round(abs / year), "سال"];

  return future ? `${fa(value)} ${unit} دیگر` : `${fa(value)} ${unit} پیش`;
}

/** مدت زمان به صورت خوانا: ۲ روز و ۴ ساعت */
export function faDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "کمتر از یک دقیقه";
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    const remHours = hours % 24;
    return remHours ? `${fa(days)} روز و ${fa(remHours)} ساعت` : `${fa(days)} روز`;
  }
  if (hours > 0) {
    const remMin = minutes % 60;
    return remMin ? `${fa(hours)} ساعت و ${fa(remMin)} دقیقه` : `${fa(hours)} ساعت`;
  }
  return `${fa(Math.max(1, minutes))} دقیقه`;
}

/** میانگین زمان پاسخ‌دهی به‌ساعت (برای نمایش در پیشخوان) */
export function faHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  if (hours < 24) return `${faNumber(hours, 1)} ساعت`;
  return `${faNumber(hours / 24, 1)} روز`;
}

/* ------------------------------------------------------------------ *
 * متن
 * ------------------------------------------------------------------ */

export function truncateText(text: string, max: number): string {
  const s = (text || "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/** شمارش واژه‌ها و زمان تقریبی مطالعه */
export function readingTime(markdown: string): { words: number; minutes: number } {
  const words = (markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 190)) };
}

/** حذف نشانه‌های مارک‌داون برای پیش‌نمایش و متادیتا */
export function stripMarkdown(markdown: string): string {
  return (markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** نرمال‌سازی متن فارسی برای جست‌وجو (ی/ك عربی، اعداد، نیم‌فاصله) */
export function normalizeFa(text: string): string {
  return en(String(text || ""))
    .toLowerCase()
    // اعراب و نشانه‌های ترکیبی عربی
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // نیم‌فاصله و نشانه‌های جهت: حذف می‌شوند تا «آموزش‌ها» و «آموزشها» یکسان شوند
    .replace(/[\u200c\u200e\u200f\u202a-\u202e\ufeff]/g, "")
    // یکسان‌سازی حروف عربی/فارسی
    .replace(/[يىﻯﻰﻱ]/g, "ی")
    .replace(/[كﻙ]/g, "ک")
    .replace(/[أإآٱﺁ]/g, "ا")
    .replace(/[ؤ]/g, "و")
    .replace(/[ۀةهٔ]/g, "ه")
    .replace(/[\u0621]/g, "")
    // نشانه‌گذاری
    .replace(/[«»"'`؛،,.:;!?()\[\]{}<>_/\\|*+~^%$#@!=-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** برجسته‌سازی عبارت جست‌وجوشده در متن */
export function highlight(text: string, query: string): Array<{ text: string; match: boolean }> {
  const q = (query || "").trim();
  if (!q) return [{ text, match: false }];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts
    .filter((p) => p !== "")
    .map((p) => ({ text: p, match: p.toLowerCase() === q.toLowerCase() }));
}

/** اعتبارسنجی شماره تماس ایران */
export function normalizePhone(input: string): string {
  let s = en(input || "").replace(/[\s\-().]/g, "");
  if (s.startsWith("+98")) s = `0${s.slice(3)}`;
  else if (s.startsWith("0098")) s = `0${s.slice(4)}`;
  else if (s.startsWith("98") && s.length === 12) s = `0${s.slice(2)}`;
  else if (/^9\d{9}$/.test(s)) s = `0${s}`;
  return s;
}

export const isMobile = (input: string): boolean => /^09\d{9}$/.test(normalizePhone(input));

export const isLandline = (input: string): boolean => {
  const s = normalizePhone(input);
  return /^0\d{2,3}\d{7,8}$/.test(s) && !s.startsWith("09");
};

export const isPhone = (input: string): boolean => isMobile(input) || isLandline(input);

export const maskPhone = (input: string): string => {
  const s = normalizePhone(input);
  if (s.length < 7) return "***";
  return `${fa(s.slice(0, 4))}${"*".repeat(Math.max(3, s.length - 7))}${fa(s.slice(-3))}`;
};

export const phoneLast4 = (input: string): string => normalizePhone(input).slice(-4);

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((input || "").trim());
}

/** اعداد انگلیسی داخل متن فارسی برای نمایش */
export function faDigitsInText(text: string): string {
  return fa(text);
}
