import type { NextConfig } from "next";
import { STATIC_BASE_PATH, isStaticExport } from "./src/lib/basepath";

const staticExport = isStaticExport();

const isDev = process.env.NODE_ENV === "development";

/**
 * سیاست امنیتی محتوا (CSP)
 * ---------------------------------------------------------------
 * تفاوت dev و production فقط در «frame-ancestors» است: سرور توسعه پشت
 * پروکسی پیش‌نمایش اجرا می‌شود و صفحه داخل iframe همان پروکسی نشان داده
 * می‌شود؛ پس در توسعه اجازه embed داده می‌شود. خروجی تولید سخت‌گیر
 * می‌ماند و embed فقط از همان دامنه ممکن است.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.openstreetmap.org https://tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  isDev ? "frame-ancestors *" : "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * پیکربندی Next.js
 * ---------------------------------------------------------------
 * حالت عادی (dev / server): اپلیکیشن Node.js با API، پایگاه داده و پنل مدیریت.
 * حالت Static Export (STATIC_EXPORT=true): خروجی HTML/JS ایستا برای
 * GitHub Pages. در این حالت:
 *   - basePath = "/Khadamat447" (project page)
 *   - صفحات داینامیک با پیام «نیازمند سرور» جایگزین می‌شوند
 *   - تصاویر optimize نمی‌شوند
 *   - headers اعمال نمی‌شوند
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: staticExport ? "export" : undefined,
  basePath: staticExport ? STATIC_BASE_PATH : "",
  trailingSlash: staticExport ? true : false,
  images: staticExport
    ? { unoptimized: true, remotePatterns: [] }
    : undefined,
  /**
   * میزبان‌های مجاز سرور توسعه
   * ---------------------------------------------------------------
   * Next.js در حالت توسعه درخواست‌های cross-origin به دارایی‌های
   * `/_next/*` را رد می‌کند (پاسخ ۴۰۳). چون این پروژه پشت پروکسی
   * پیش‌نمایش (میزبان‌هایی مانند `*.e2b.app`) اجرا می‌شود، بدون این
   * فهرست CSS و JS صفحات بارگذاری نمی‌شود و پیش‌نمایش ناقص می‌ماند.
   * این تنظیم فقط بر سرور توسعه اثر دارد و بر خروجی تولید بی‌اثر است.
   */
  allowedDevOrigins: ["*.e2b.app", "*.vercel.app", "*.github.io", "*.ngrok-free.app", "*.loca.lt"],
  async headers() {
    if (staticExport) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // در توسعه حذف می‌شود تا پیش‌نمایش داخل iframe بالا بیاید؛
          // در تولید همان SAMEORIGIN (محافظت از کلیک‌ربایی) برجاست.
          ...(isDev ? [] : [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/track/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/search",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;
