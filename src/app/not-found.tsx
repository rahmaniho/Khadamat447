import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-black text-brand-700">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-extrabold">صفحه موردنظر پیدا نشد</h1>
      <p className="mt-3 text-slate-600">نشانی وارد‌شده اشتباه است یا این صفحه دیگر وجود ندارد.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-brand-700 px-5 py-3 font-bold text-white">بازگشت به صفحه اصلی</Link>
        <Link href="/services" className="rounded-xl border border-brand-200 px-5 py-3 font-bold text-brand-800">مشاهده خدمات</Link>
        <Link href="/request" className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-5 py-3 font-bold text-brand-800">
          <Icon name="send" size={18} /> ثبت درخواست
        </Link>
      </div>
    </main>
  );
}
