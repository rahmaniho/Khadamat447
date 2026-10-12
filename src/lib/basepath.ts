/**
 * مسیر پایه (basePath) — منبع یکتای حقیقت
 * ---------------------------------------------------------------
 * در حالت خروجی استاتیک (GitHub Pages، پروژه در زیرمسیر) همه ارجاع‌ها
 * باید با پیشوند `/Khadamat447` تولید شوند. این مقدار قبلاً فقط داخل
 * `next.config.ts` بود و `robots.ts` و خروجی manifest از آن بی‌خبر
 * می‌ماندند؛ اکنون هر دو از همین ماژول می‌خوانند تا واگرایی رخ ندهد.
 */

/** نام مخزن — زیرمسیر انتشار روی GitHub Pages */
export const STATIC_BASE_PATH = "/Khadamat447";

/** آیا فرایند ساخت در حالت خروجی استاتیک است؟ */
export function isStaticExport(): boolean {
  return process.env.STATIC_EXPORT === "true";
}

/** مسیر پایه فعال در زمان ساخت (در حالت عادی رشته خالی) */
export function activeBasePath(): string {
  return isStaticExport() ? STATIC_BASE_PATH : "";
}

/**
 * پیشوندگذاری نشانی دارایی‌های عمومی با basePath.
 * اگر مسیر از پیش با basePath آغاز شده باشد، دوباره پیشوند اضافه نمی‌شود
 * تا با اسکریپت پس‌پردازش خروجی استاتیک (`scripts/fix-basepath.py`) تداخل نکند.
 */
export function withBasePath(path: string, base: string = activeBasePath()): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base && (normalized === base || normalized.startsWith(`${base}/`))) {
    return normalized;
  }
  return `${base}${normalized}`;
}

