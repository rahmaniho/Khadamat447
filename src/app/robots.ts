import type { MetadataRoute } from "next";
import { loadSite } from "@/lib/site";
import { IS_STATIC } from "@/lib/static-data";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseFromEnv = process.env.NEXT_PUBLIC_SITE_URL || "";
  const base = IS_STATIC
    ? (baseFromEnv || "https://rahmaniho.github.io/Khadamat447")
    : baseFromEnv;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/track", "/search", "/request/success"],
      },
    ],
    ...(base ? { sitemap: `${base}/sitemap.xml`, host: base } : {}),
  };
}
