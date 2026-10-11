import type { Metadata } from "next";
import { MyRequestsPanel } from "@/components/track/my-requests-panel";
import { PageHero, Section } from "@/components/site/section";
import { Badge } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "کارتابل من",
  description: "فهرست درخواست‌های ثبت‌شده در این مرورگر و دسترسی سریع به وضعیت هر درخواست.",
  path: "/my-requests",
  noindex: true,
});

export default function MyRequestsPage() {
  return (
    <>
      <PageHero
        eyebrow="کارتابل شخصی"
        icon="user"
        title="درخواست‌های من"
        description="درخواست‌هایی که در همین مرورگر ثبت کرده‌اید، این‌جا فهرست می‌شوند تا نیازی به جست‌وجوی کد پیگیری نداشته باشید."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "کارتابل من", href: "/my-requests" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="lock" className="bg-white/12 text-white ring-white/25">
              ذخیره‌شده در مرورگر شما
            </Badge>
            <Badge tone="brand" icon="track" className="bg-white/12 text-white ring-white/25">
              دسترسی سریع به وضعیت
            </Badge>
          </>
        }
      />
      <Section>
        <MyRequestsPanel />
      </Section>
    </>
  );
}
