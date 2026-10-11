import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackEntry } from "@/components/track/track-entry";
import { DEMO_HINTS } from "@/lib/store/hints";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "پیگیری درخواست",
  description:
    "با کد پیگیری و شماره تماس، وضعیت درخواست خود را در سامانه دفتر خدمات سلامت ۴۷۷ قزوین مشاهده کنید: مرحله جاری، رویدادها و مدارک.",
  path: "/track",
  keywords: ["پیگیری درخواست", "کد پیگیری", "وضعیت درخواست"],
  noindex: true,
});

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="h-[24rem]" />}>
      <TrackEntry demoHints={DEMO_HINTS} />
    </Suspense>
  );
}
