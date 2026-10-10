import type { Metadata, Viewport } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export const metadata: Metadata = {
  title: {
    default: "دفتر خدمات سلامت ۴۷۷ قزوین | ثبت درخواست آنلاین",
    template: "%s | دفتر خدمات سلامت ۴۷۷",
  },
  description:
    "معرفی خدمات دفتر خدمات سلامت ۴۷۷ در قزوین؛ مشاهده خدمات کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی، همراه با ثبت درخواست آنلاین.",
  applicationName: "دفتر خدمات سلامت ۴۷۷",
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          رفتن به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
