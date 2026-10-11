import type { Metadata } from "next";
import { AuditManager } from "@/components/admin/system-managers";

export const metadata: Metadata = {
  title: "سابقه رویدادها",
  description: "گزارش کامل اقدام‌های انجام‌شده در سامانه.",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <AuditManager />;
}
