import type { MetadataRoute } from "next";
import { absolute, siteUrl } from "@/lib/seo";
import { activeBasePath } from "@/lib/basepath";

export const dynamic = "force-static";

/**
 * فهرست خزنده‌های هوش مصنوعی و موتورهای مولد (GEO)
 * ---------------------------------------------------------------
 * این ربات‌ها محتوای سایت را برای پاسخ‌دهی در دستیارهای هوش مصنوعی
 * و جست‌وجوی مولد می‌خوانند. سیاست ما: دسترسی آزاد به محتوای عمومی،
 * بدون دسترسی به پیشخوان مدیریت و صفحه‌های خصوصی.
 */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "DuckAssistBot",
  "cohere-training-data-robert",
  "Meta-ExternalAgent",
];

/** مسیرهای خصوصی که از فهرست همه خزنده‌ها (عادی و هوش مصنوعی) خارج است */
export function disallowedPaths(base: string): string[] {
  return ["/admin", "/admin/", "/track", "/search", "/my-requests", "/request/success"].map(
    (path) => `${base}${path}`,
  );
}

/**
 * نقشه راهنمای ربات‌ها: فرم‌ها و پیشخوان مدیریت از فهرست خارج است.
 * در حالت خروجی استاتیک همه مسیرها زیر basePath قرار می‌گیرند، پس
 * قواعد Disallow هم باید پیشوند بگیرند؛ در غیر این صورت روی GitHub Pages
 * مسیرهای واقعی (`/Khadamat447/admin`) اصلاً مسدود نمی‌شدند.
 */
export default function robots(): MetadataRoute.Robots {
  const base = activeBasePath();
  const off = disallowedPaths(base);

  return {
    rules: [
      {
        userAgent: "*",
        allow: base ? `${base}/` : "/",
        disallow: off,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: base ? `${base}/` : "/",
        disallow: off,
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: siteUrl(),
  };
}
