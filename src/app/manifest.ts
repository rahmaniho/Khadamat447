import type { MetadataRoute } from "next";

/** مانیفست وب‌اپ: نام و نماد برند برای افزودن سایت به صفحه اصلی گوشی */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "دفتر خدمات سلامت ۴۷۷ قزوین",
    short_name: "خدمات سلامت ۴۷۷",
    description: "ثبت آنلاین درخواست و پیگیری خدمات سلامت و بهداشت در قزوین.",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f766e",
    icons: [
      { src: "/brand/logo-mark.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
