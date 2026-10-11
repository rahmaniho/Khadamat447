import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { baseMetadata, jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/content/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const vazirmatn = localFont({
  src: "../assets/fonts/Vazirmatn-var.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-vazirmatn",
  preload: true,
});

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
  /* پوشش کامل صفحه در گوشی‌های ناچ‌دار؛ اجزای شناور با env(safe-area-inset-*)
     از روی نوار وضعیت و نشانگر خانه کنار می‌روند */
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        {/*
          اسکریپت مسدودکننده تم — پیش از نخستین رنگ‌آمیزی اجرا می‌شود تا
          کاربران حالت تاریک «پرش سفید» نبینند. جزئیات در src/lib/theme.ts
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
