import type { Metadata } from "next";
import { FaqsManager } from "@/components/admin/content-managers";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description: "مدیریت پرسش‌های متداول مراجعان و دسته‌بندی آن‌ها.",
  robots: { index: false, follow: false },
};

export default function AdminFaqsPage() {
  return <FaqsManager />;
}
