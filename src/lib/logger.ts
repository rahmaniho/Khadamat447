/** ثبت رویدادها و خطاها (کنسول + فایل JSON Lines در مسیر .data/logs) */
import fs from "node:fs";
import path from "node:path";

export type LogLevel = "info" | "warn" | "error" | "security";

const LOG_DIR = path.join(process.cwd(), ".data", "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

export function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
  const entry = { ts: new Date().toISOString(), level, message, ...meta };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn" || level === "security") console.warn(line);
  else console.log(line);

  if (process.env.LOG_TO_FILE === "false") return;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch {
    /* ذخیره فایل لاگ اختیاری است و نباید جریان برنامه را متوقف کند */
  }
}

export const logInfo = (m: string, meta?: Record<string, unknown>) => log("info", m, meta);
export const logWarn = (m: string, meta?: Record<string, unknown>) => log("warn", m, meta);
export const logError = (m: string, meta?: Record<string, unknown>) => log("error", m, meta);
export const logSecurity = (m: string, meta?: Record<string, unknown>) => log("security", m, meta);

/** حذف داده‌های حساس از آبجکت پیش از ثبت در لاگ */
export function redact<T extends Record<string, unknown>>(obj: T, keys: string[] = ["password", "phone", "email", "token", "secret"]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = keys.some((x) => k.toLowerCase().includes(x)) ? "[redacted]" : v;
  return out;
}
