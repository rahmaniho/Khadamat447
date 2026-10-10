import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

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
  "frame-ancestors 'self'",
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
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? "/Khadamat447" : "",
  trailingSlash: isStaticExport ? true : false,
  images: isStaticExport
    ? { unoptimized: true, remotePatterns: [] }
    : undefined,
  // در حالت static export این ماژول‌ها نباید به‌عنوان external بار شوند
  serverExternalPackages: isStaticExport ? [] : ["pg", "nodemailer"],
  async headers() {
    if (isStaticExport) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
