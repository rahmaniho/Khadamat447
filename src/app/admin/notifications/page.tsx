import type { Metadata } from "next";
import { NotificationsManager } from "@/components/admin/notifications-manager";

export const metadata: Metadata = {
  title: "صف اعلان‌ها",
  description: "پایش و ارسال مجدد پیام‌های اطلاع‌رسانی سامانه.",
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  return <NotificationsManager />;
}
