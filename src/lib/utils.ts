import { createHmac, randomBytes, randomUUID } from "node:crypto";

/* --------------------------- شناسه و کد --------------------------- */

/** شناسه یکتا (UUID v4) برای کلیدهای اصلی */
export const newId = (): string => randomUUID();

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون کاراکترهای مبهم

/** کد پیگیری تصادفی و غیرقابل حدس: K447-XXXXX-XXXXX */
export function newTrackingCode(): string {
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `K447-${out.slice(0, 5)}-${out.slice(5)}`;
}

/* ------------------------------ اعداد ----------------------------- */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/* ------------------------------ تاریخ ----------------------------- */

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
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

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

/** نمایش تاریخ به شمسی، مثال: ۱۹ مهر ۱۴۰۴ - ۱۴:۳۲ */
export function formatFaDate(input?: string | Date | null, withTime = true): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  const [jy, jm, jd] = gregorianToJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  const base = `${toFaDigits(jd)} ${FA_MONTHS[jm - 1]} ${toFaDigits(jy)}`;
  if (!withTime) return base;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${base} - ${toFaDigits(`${hh}:${mm}`)} (UTC)`;
}

export function formatFaDay(input?: string | Date | null): string {
  return formatFaDate(input, false);
}

/* ---------------------------- شماره تماس --------------------------- */

/** یکسان‌سازی شماره تماس ایران: اعداد فارسی، +۹۸، ۰۰۹۸ و ... -> 09xxxxxxxxx */
export function normalizePhone(input: string): string {
  let s = toEnDigits(input || "").replace(/[\s\-().]/g, "");
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);
  else if (/^9\d{9}$/.test(s)) s = "0" + s;
  return s;
}

export function isMobilePhone(input: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(input));
}

export function isLandlinePhone(input: string): boolean {
  const s = normalizePhone(input);
  return /^0\d{2,3}\d{7,8}$/.test(s) && !s.startsWith("09");
}

export function isAnyPhone(input: string): boolean {
  return isMobilePhone(input) || isLandlinePhone(input);
}

/** پنهان‌سازی شماره برای نمایش در صفحه پیگیری: ۰۹۱۲***۳۴۵۶ */
export function maskPhone(input: string): string {
  const s = normalizePhone(input);
  if (s.length < 7) return "***";
  return `${s.slice(0, 4)}${"*".repeat(Math.max(0, s.length - 7))}${s.slice(-3)}`;
}

export const phoneLast4 = (input: string): string => normalizePhone(input).slice(-4);

/* ----------------------------- متفرقه ----------------------------- */

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function truncate(input: string, max: number): string {
  const s = (input || "").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/["'`()[\]{}<>?!.,،؛:;]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** هش یک‌طرفه برای ذخیره IP بدون نگهداری آدرس خام */
export function hashValue(value: string, salt: string): string {
  return createHmac("sha256", salt).update(value).digest("hex");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${toFaDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toFaDigits((bytes / 1024).toFixed(1))} کیلوبایت`;
  return `${toFaDigits((bytes / (1024 * 1024)).toFixed(2))} مگابایت`;
}

export function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined || raw === "") return fallback;
  if (typeof raw !== "string") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
