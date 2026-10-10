import type { MetadataRoute } from "next";
import { loadSite } from "@/lib/site";
import { getActiveServices, getPublishedArticles } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** sitemap پویا: فقط صفحات عمومی؛ پنل مدیریت، پیگیری، جست‌وجو و صفحات فرم خصوصی حذف شده‌اند */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await loadSite();
  const base = site.siteUrl;
  if (!base) return [];
  const [services, articles] = await Promise.all([getActiveServices(), getPublishedArticles()]);
  const now = new Date();
  const staticPages = ["/", "/services", "/request", "/articles", "/faq", "/about", "/contact", "/guide", "/privacy", "/terms"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: new Date(s.updated_at), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...articles.map((a) => ({ url: `${base}/articles/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
