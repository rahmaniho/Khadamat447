"use client";

/**
 * شروع فرم ثبت درخواست
 * ---------------------------------------------------------------
 * پارامتر «service» را از نشانی می‌خواند تا فرم از همان خدمت آغاز شود.
 * این کار باعث می‌شود صفحه بدون وابستگی به رندر سرور هم کار کند.
 */
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/site/section";
import { Badge } from "@/components/ui/primitives";
import { RequestWizard } from "@/components/request/wizard";
import { SERVICES } from "@/lib/content";

export function RequestEntry() {
  const params = useSearchParams();
  const requestedParam = params.get("service") ?? "";
  const requested = SERVICES.some((service) => service.slug === requestedParam) ? requestedParam : "";
  const service = SERVICES.find((item) => item.slug === requested);

  return (
    <>
      <PageHero
        eyebrow="فرم ثبت درخواست"
        icon="send"
        title={service ? `ثبت درخواست: ${service.title}` : "ثبت درخواست آنلاین"}
        description={
          service
            ? service.tagline
            : "در پنج گام کوتاه، درخواست خود را ثبت کنید. فرم برای هر خدمت اختصاصی است و در پایان، کد پیگیری یکتا دریافت می‌کنید."
        }
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "ثبت درخواست", href: "/request" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="clock" className="bg-white/12 text-white ring-white/25">
              بدون نیاز به ثبت‌نام
            </Badge>
            <Badge tone="brand" icon="lock" className="bg-white/12 text-white ring-white/25">
              بدون دریافت کد ملی
            </Badge>
            <Badge tone="brand" icon="track" className="bg-white/12 text-white ring-white/25">
              کد پیگیری یکتا
            </Badge>
          </>
        }
      />

      <RequestWizard initialService={requested} />
    </>
  );
}
