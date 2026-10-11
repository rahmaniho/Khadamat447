import type { Metadata } from "next";
import { ArticlesManager } from "@/components/admin/content-managers";

export const metadata: Metadata = {
  title: "مدیریت مقالات",
  description: "نوشتن، بازبینی و انتشار محتوای آموزشی سایت.",
  robots: { index: false, follow: false },
};

export default function AdminArticlesPage() {
  return <ArticlesManager />;
}
