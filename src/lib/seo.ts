import type { Metadata } from "next";
import type { PublicSiteConfig } from "@/lib/settings";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  site: PublicSiteConfig;
  index?: boolean;
  noindex?: boolean;
}): Metadata {
  const canonical = opts.site.siteUrl ? `${opts.site.siteUrl}${opts.path}` : undefined;
  const noindex = opts.noindex || opts.index === false;
  return {
    title: opts.title,
    description: opts.description,
    alternates: canonical ? { canonical } : { canonical: opts.path },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      locale: "fa_IR",
      type: "website",
      siteName: opts.site.name,
      url: canonical,
    },
  };
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
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    description: site.description,
    url: site.siteUrl || undefined,
    telephone: phones.length ? phones : undefined,
    email: site.publicEmail || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "IR",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng },
    hasMap: `https://www.google.com/maps?q=${site.lat},${site.lng}`,
    ...(site.hours.length
      ? {
          openingHoursSpecification: site.hours
            .filter((h) => !h.closed)
            .map((h) => ({ "@type": "OpeningHoursSpecification", description: `${h.day}: ${h.hours}` })),
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
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
