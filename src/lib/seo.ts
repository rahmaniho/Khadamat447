import type { Metadata } from "next";
import { SERVICES } from "@/lib/content";
import { SITE } from "@/lib/content/site";
import { toFaDigits } from "@/lib/digits";

/** نشانی پایه سایت (روی Vercel به‌صورت خودکار تعیین می‌شود) */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const DEFAULT_OG_IMAGE = "/brand/og-default.jpg";

export function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export const SITE_TITLE = `${SITE.name} | ثبت درخواست آنلاین خدمات بهداشت و سلامت`;

export const SITE_DESCRIPTION =
  "دفتر خدمات سلامت ۴۷۷ قزوین: ثبت و پیگیری آنلاین درخواست کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی — با کد پیگیری اختصاصی، راهنمای مدارک و پاسخ کارشناس.";

export const SITE_KEYWORDS = [
  "کارت بهداشت",
  "صدور کارت بهداشت",
  "تمدید کارت بهداشت",
  "آموزش بهداشت اصناف",
  "صلاحیت بهداشت",
  "ممیزی بهداشتی",
  "دفتر خدمات سلامت ۴۷۷",
  "خدمات سلامت قزوین",
  "بهداشت اصناف قزوین",
  "قرارداد خدمات بهداشتی",
];

/** متادیتای پایه سراسری */
export function baseMetadata(): Metadata {
  const url = siteUrl();
  return {
    metadataBase: new URL(url),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE.name}`,
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url }],
    creator: SITE.name,
    publisher: SITE.name,
    category: "خدمات بهداشتی و سلامت",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      url,
      siteName: SITE.name,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [{ url: absolute(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [absolute(DEFAULT_OG_IMAGE)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png" }],
      apple: [{ url: "/apple-icon.png" }],
      shortcut: ["/icon.png"],
    },
    manifest: "/manifest.webmanifest",
    formatDetection: { telephone: true, address: true, email: true },
    /* نصب روی صفحه اصلی گوشی (PWA) با رفتار بومی در iOS */
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SITE.shortName,
    },
  };
}

/** متادیتای صفحه‌های داخلی */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  noindex,
  keywords,
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
}): Metadata {
  const url = absolute(path);
  const ogImage = absolute(image ?? DEFAULT_OG_IMAGE);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type,
      locale: "fa_IR",
      siteName: SITE.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt ?? title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

/* ------------------------------------------------------------------ *
 * داده‌های ساختاریافته (JSON-LD)
 * ------------------------------------------------------------------ */

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const FA_PHONE = (phone: string) => `+98${phone.replace(/^0/, "")}`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "HealthAndBeautyBusiness"],
    "@id": `${siteUrl()}/#organization`,
    name: SITE.name,
    alternateName: SITE.latin,
    description: SITE.description,
    url: siteUrl(),
    logo: absolute("/brand/logo-mark.png"),
    image: absolute(DEFAULT_OG_IMAGE),
    email: SITE.email,
    telephone: SITE.phones.map((p) => FA_PHONE(p.value)),
    slogan: SITE.slogan,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: SITE.city,
      addressRegion: SITE.province,
      addressCountry: "IR",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lng },
    hasMap: SITE.mapProfileUrl,
    sameAs: SITE.social.map((s) => s.url),
    areaServed: [
      { "@type": "City", name: SITE.city },
      { "@type": "AdministrativeArea", name: `استان ${SITE.province}` },
    ],
    openingHoursSpecification: SITE.hoursSpecification.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.days.map((day) => `https://schema.org/${day}`),
      opens: spec.opens,
      closes: spec.closes,
    })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: FA_PHONE(SITE.phones[1].value),
        email: SITE.email,
        availableLanguage: ["fa-IR"],
        hoursAvailable: SITE.hours
          .filter((h) => !h.closed)
          .map((h) => ({ "@type": "OpeningHoursSpecification", description: `${h.day}: ${h.hours}` })),
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `خدمات ${SITE.name}`,
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.summary,
          url: absolute(`/services/${service.slug}`),
        },
      })),
    },
    knowsAbout: SITE_KEYWORDS.slice(0, 6),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: SITE.name,
    url: siteUrl(),
    inLanguage: "fa-IR",
    publisher: { "@id": `${siteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl()}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.href),
    })),
  };
}

/**
 * فهرست ساختاریافته (ItemList) — برای صفحه‌های فهرست مانند خدمات و مقالات.
 * به موتورهای جست‌وجو و موتورهای مولد (GEO) کمک می‌کند ترتیب و اعضای
 * فهرست را دقیق بفهمند.
 */
export function itemListJsonLd({
  name,
  items,
  path,
}: {
  name: string;
  items: Array<{ name: string; href: string; description?: string }>;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(path ? { url: absolute(path) } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absolute(item.href),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function serviceJsonLd({
  name,
  description,
  slug,
  areaServed = SITE.city,
}: {
  name: string;
  description: string;
  slug: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: absolute(`/services/${slug}`),
    provider: { "@id": `${siteUrl()}/#organization` },
    areaServed: { "@type": "City", name: areaServed },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absolute(`/request?service=${slug}`),
      servicePhone: FA_PHONE(SITE.phones[0].value),
      availableLanguage: "fa-IR",
    },
  };
}

export function articleJsonLd({
  title,
  description,
  slug,
  image,
  author,
  publishedAt,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "fa-IR",
    articleSection: category,
    image: [absolute(image)],
    author: { "@type": "Organization", name: author },
    publisher: { "@id": `${siteUrl()}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(`/articles/${slug}`) },
    datePublished: publishedAt,
    dateModified: publishedAt,
  };
}

export function openingHoursText(): string {
  return SITE.hours.map((h) => `${h.day}: ${h.closed ? "تعطیل" : toFaDigits(h.hours)}`).join(" — ");
}
