import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExplorer } from "@/components/site/search-explorer";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "جست‌وجو در سایت",
  description: "جست‌وجوی متن کامل در خدمات، مقالات آموزشی، پرسش‌های متداول و راهنماهای دفتر خدمات سلامت ۴۷۷.",
  path: "/search",
  noindex: true,
});

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-[24rem]" />}>
      <SearchExplorer />
    </Suspense>
  );
}
