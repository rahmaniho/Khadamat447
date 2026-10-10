import Link from "next/link";
import { Alert } from "@/components/ui";

export const metadata = { title: "دسترسی مجاز نیست", robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-2xl font-black">دسترسی مجاز نیست</h1>
      <Alert tone="warning">نقش کاربری شما اجازه مشاهده این بخش را ندارد. در صورت نیاز، با مدیر کل تماس بگیرید.</Alert>
      <Link href="/admin" className="inline-block font-bold text-brand-700 underline">بازگشت به داشبورد</Link>
    </div>
  );
}
