import type { MetadataRoute } from "next";
import { loadSite } from "@/lib/site";
import { getActiveServices, getPublishedArticles } from "@/lib/queries";
import { IS_STATIC } from "@/lib/static-data";

// در حالت dev/server، sitemap در هر درخواست تولید می‌شود.
// در حالت static export نیز force-static سازگار است.
export const dynamic = "force-static";

/** sitemap: فقط صفحات عمومی؛ پنل مدیریت، پیگیری، جست‌وجو و صفحات فرم خصوصی حذف شده‌اند */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await loadSite();
  // در حالت static از basePath استفاده می‌کنیم تا URL ها صحیح باشند
  const baseFromEnv = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;
  const base = IS_STATIC
    ? (baseFromEnv || "https://rahmaniho.github.io/Khadamat447")
    : baseFromEnv || site.siteUrl;
  const [services, articles] = await Promise.all([getActiveServices(), getPublishedArticles()]);
  const now = new Date();
  const staticPages = ["/", "/services", "/request", "/articles", "/faq", "/about", "/contact", "/guide", "/privacy", "/terms"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: new Date(s.updated_at), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...articles.map((a) => ({ url: `${base}/articles/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
