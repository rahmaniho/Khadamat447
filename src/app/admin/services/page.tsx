import type { Metadata } from "next";
import { ServicesManager } from "@/components/admin/content-managers";

export const metadata: Metadata = {
  title: "مدیریت خدمات",
  description: "ویرایش متن، فیلدهای فرم و وضعیت نمایش خدمات دفتر.",
  robots: { index: false, follow: false },
};

export default function AdminServicesPage() {
  return <ServicesManager />;
}
