import type { Metadata } from "next";
import { AnnouncementsManager } from "@/components/admin/content-managers";

export const metadata: Metadata = {
  title: "اطلاعیه‌ها",
  description: "مدیریت پیام‌های اطلاع‌رسانی سایت و پیشخوان.",
  robots: { index: false, follow: false },
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager />;
}
