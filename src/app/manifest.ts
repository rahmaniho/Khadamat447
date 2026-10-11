import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content/site";

export const dynamic = "force-static";

/** مانیفست وب (PWA سبک): افزودن سایت به صفحه اصلی گوشی */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — قزوین`,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: "fa-IR",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f9f9",
    theme_color: "#1e7a71",
    categories: ["health", "business", "government"],
    icons: [
      { src: "/brand/logo-mark.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "ثبت درخواست", short_name: "ثبت درخواست", url: "/request" },
      { name: "پیگیری درخواست", short_name: "پیگیری", url: "/track" },
      { name: "خدمات", short_name: "خدمات", url: "/services" },
    ],
  };
}
