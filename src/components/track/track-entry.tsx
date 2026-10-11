"use client";

import { useSearchParams } from "next/navigation";
import { PageHero, Section } from "@/components/site/section";
import { Badge } from "@/components/ui/primitives";
import { TrackPanel } from "@/components/track/track-panel";
import { DEMO_HINTS, type DemoHint } from "@/lib/store/hints";

export function TrackEntry({ demoHints = DEMO_HINTS }: { demoHints?: DemoHint[] }) {
  const params = useSearchParams();
  const code = params.get("code") ?? "";

  return (
    <>
      <PageHero
        eyebrow="پیگیری درخواست"
        icon="track"
        title="وضعیت درخواست خود را ببینید"
        description="کد پیگیری و چهار رقم آخر شماره تماس ثبت‌شده را وارد کنید. اگر کد پیگیری را گم کرده‌اید، از «کارتابل من» استفاده کنید یا با دفتر تماس بگیرید."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "پیگیری", href: "/track" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="lock" className="bg-white/12 text-white ring-white/25">
              دسترسی با کد پیگیری
            </Badge>
            <Badge tone="brand" icon="user" className="bg-white/12 text-white ring-white/25">
              کارتابل شخصی
            </Badge>
          </>
        }
      />
      <Section>
        <TrackPanel initialCode={code} demoHints={demoHints} />
      </Section>
    </>
  );
}
