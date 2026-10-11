import type { MetadataRoute } from "next";
import { absolute, siteUrl } from "@/lib/seo";
import { activeBasePath } from "@/lib/basepath";

export const dynamic = "force-static";

/**
 * نقشه راهنمای ربات‌ها: فرم‌ها و پیشخوان مدیریت از فهرست خارج است.
 * در حالت خروجی استاتیک همه مسیرها زیر basePath قرار می‌گیرند، پس
 * قواعد Disallow هم باید پیشوند بگیرند؛ در غیر این صورت روی GitHub Pages
 * مسیرهای واقعی (`/Khadamat447/admin`) اصلاً مسدود نمی‌شدند.
 */
export default function robots(): MetadataRoute.Robots {
  const base = activeBasePath();
  const off = ["/admin", "/admin/", "/track", "/search", "/my-requests", "/request/success"].map(
    (path) => `${base}${path}`,
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: base ? `${base}/` : "/",
        disallow: off,
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: siteUrl(),
  };
}
