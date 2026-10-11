import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { baseMetadata, jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = baseMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9f9" },
    { media: "(prefers-color-scheme: dark)", color: "#071110" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Vazirmatn-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          // داده ساختاریافته سازمان، وب‌سایت و اطلاعات تماس
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd()) }} />
        <meta name="author" content={SITE.name} />
        <meta name="geo.region" content="IR-26" />
        <meta name="geo.placename" content={SITE.city} />
        <meta name="geo.position" content={`${SITE.lat};${SITE.lng}`} />
        <meta name="ICBM" content={`${SITE.lat}, ${SITE.lng}`} />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
