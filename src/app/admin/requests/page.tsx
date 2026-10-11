import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestsTable } from "@/components/admin/requests-table";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "کارتابل درخواست‌ها",
  description: "مدیریت، فیلتر و پیگیری درخواست‌های ثبت‌شده در سامانه.",
  robots: { index: false, follow: false },
};

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full" />}>
      <RequestsTable />
    </Suspense>
  );
}
