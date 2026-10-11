import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessEntry } from "@/components/request/success-entry";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "درخواست با موفقیت ثبت شد",
  description: "کد پیگیری درخواست و راهنمای پیگیری وضعیت در سامانه دفتر خدمات سلامت ۴۷۷.",
  path: "/request/success",
  noindex: true,
});

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="h-[24rem]" />}>
      <SuccessEntry />
    </Suspense>
  );
}
