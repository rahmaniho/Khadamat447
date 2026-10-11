import type { MetadataRoute } from "next";
import { absolute, siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** نقشه راهنمای ربات‌ها: فرم‌ها و پیشخوان مدیریت از فهرست خارج است */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/track", "/search", "/my-requests", "/request/success"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: siteUrl(),
  };
}
