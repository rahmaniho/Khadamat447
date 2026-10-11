import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestDetail } from "@/components/admin/request-detail";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "جزئیات درخواست",
  description: "نمایش کامل پرونده درخواست، مدارک، سابقه وضعیت‌ها و اعلان‌ها.",
  robots: { index: false, follow: false },
};

export default function AdminRequestDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full" />}>
      <RequestDetail />
    </Suspense>
  );
}
