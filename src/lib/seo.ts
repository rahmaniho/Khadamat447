import type { Metadata } from "next";
import type { PublicSiteConfig } from "@/lib/settings";

/** تصویر پیش‌فرض اشتراک‌گذاری (۱۲۰۰×۶۳۰) */
export const DEFAULT_OG_IMAGE = "/brand/og-default.jpg";

/** نشانی مطلق یک فایل عمومی؛ اگر دامنه تنظیم نشده باشد، نشانی نسبی برمی‌گرداند */
export function absoluteAsset(site: PublicSiteConfig, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return site.siteUrl ? `${site.siteUrl}${path}` : path;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  site: PublicSiteConfig;
  index?: boolean;
  noindex?: boolean;
  /** تصویر اختصاصی صفحه (مسیر عمومی). در نبود آن، تصویر پیش‌فرض برند استفاده می‌شود. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const canonical = opts.site.siteUrl ? `${opts.site.siteUrl}${opts.path}` : undefined;
  const noindex = opts.noindex || opts.index === false;
  const image = absoluteAsset(opts.site, opts.image || DEFAULT_OG_IMAGE);
  const imageAlt = opts.imageAlt || `${opts.site.name} - ${opts.site.city}`;
  // اگر عنوان خودِ نام دفتر را دارد، قالب عنوان سایت (که نام دفتر را اضافه می‌کند) اعمال نمی‌شود تا تکرار نشود
  const title = opts.title.includes("۴۷۷") ? { absolute: opts.title } : opts.title;
  return {
    title,
    description: opts.description,
    alternates: canonical ? { canonical } : { canonical: opts.path },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      locale: "fa_IR",
      type: opts.type ?? "website",
      siteName: opts.site.name,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

/* ---------------- ساعات کاری: تبدیل متن فارسی به فرمت ISO ---------------- */

function toAsciiDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** «۰۸:۰۰ تا ۱۶:۰۰» → { opens: "08:00", closes: "16:00" } */
export function parseHoursRange(text: string): { opens: string; closes: string } | null {
  const m = toAsciiDigits(text).match(/(\d{1,2})(?::(\d{2}))?\s*(?:تا|-|–|—)\s*(\d{1,2})(?::(\d{2}))?/);
  if (!m) return null;
  const pad = (h: string, mm?: string) => `${h.padStart(2, "0")}:${mm ?? "00"}`;
  return { opens: pad(m[1], m[2]), closes: pad(m[3], m[4]) };
}

export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(site: PublicSiteConfig) {
  const phones = [site.phone1, site.phone2].filter(Boolean).map((p) => `+98${p.replace(/^0/, "")}`);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: site.description,
    url: site.siteUrl || undefined,
    logo: absoluteAsset(site, "/brand/logo-mark.png"),
    image: absoluteAsset(site, DEFAULT_OG_IMAGE),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "IR",
    },
    telephone: phones.length ? phones : undefined,
    email: site.publicEmail || undefined,
  };
}

export function localBusinessJsonLd(site: PublicSiteConfig) {
  const phones = [site.phone1, site.phone2].filter(Boolean).map((p) => `+98${p.replace(/^0/, "")}`);
  const openingHoursSpecification = site.hours
    .filter((h) => !h.closed)
    .map((h) => {
      const range = parseHoursRange(h.hours);
      return {
        "@type": "OpeningHoursSpecification",
        description: `${h.day}: ${h.hours}`,
        ...(range ? { opens: range.opens, closes: range.closes } : {}),
      };
    });
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": site.siteUrl ? `${site.siteUrl}/#localbusiness` : undefined,
    name: site.name,
    description: site.description,
    url: site.siteUrl || undefined,
    logo: absoluteAsset(site, "/brand/logo-mark.png"),
    image: absoluteAsset(site, DEFAULT_OG_IMAGE),
    telephone: phones.length ? phones : undefined,
    email: site.publicEmail || undefined,
    knowsLanguage: "fa",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressRegion: site.province,
      addressCountry: "IR",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng },
    hasMap: `https://www.google.com/maps?q=${site.lat},${site.lng}`,
    areaServed: [
      { "@type": "City", name: site.city },
      { "@type": "AdministrativeArea", name: `استان ${site.province}` },
    ],
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/** ساختار WebSite با قابلیت جست‌وجو در سایت */
export function websiteJsonLd(site: PublicSiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.siteUrl || undefined,
    inLanguage: "fa-IR",
    publisher: { "@type": "Organization", name: site.name },
    potentialAction: site.siteUrl
      ? {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site.siteUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        }
      : undefined,
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
