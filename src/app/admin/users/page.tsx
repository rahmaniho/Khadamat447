import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/system-managers";

export const metadata: Metadata = {
  title: "کاربران و نقش‌ها",
  description: "مدیریت کاربران کارکنان و سطوح دسترسی نقش‌محور.",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersManager />;
}
