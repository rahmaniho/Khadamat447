import type { Metadata } from "next";
import { SettingsManager } from "@/components/admin/system-managers";

export const metadata: Metadata = {
  title: "تنظیمات سامانه",
  description: "اطلاعات دفتر، کانال‌های اطلاع‌رسانی و محدودیت‌های بارگذاری.",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
