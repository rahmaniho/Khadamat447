import type { Metadata } from "next";
import { AccountManager } from "@/components/admin/system-managers";

export const metadata: Metadata = {
  title: "حساب کاربری",
  description: "نمایه، نقش و فعالیت‌های اخیر کاربر جاری.",
  robots: { index: false, follow: false },
};

export default function AdminAccountPage() {
  return <AccountManager />;
}
