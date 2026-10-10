import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Icon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { ButtonLink } from "@/components/ui";
import { LAST_TRACKING_COOKIE } from "@/lib/request-cookie";

export const metadata: Metadata = {
  title: "ثبت درخواست انجام شد",
  robots: { index: false, follow: false },
};

export default async function RequestSuccessPage() {
  const store = await cookies();
  const code = store.get(LAST_TRACKING_COOKIE)?.value || "";

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-900/5 md:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon name="check" size={34} />
        </span>
        <h1 className="mt-6 text-2xl font-black md:text-3xl">درخواست شما ثبت شد</h1>
        {code ? (
          <>
            <p className="mt-4 leading-8 text-slate-600">این کد پیگیری را ذخیره یا کپی کنید. برای پیگیری وضعیت به آن نیاز دارید.</p>
            <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-5">
              <p className="text-xs font-bold text-brand-700">کد پیگیری</p>
              <p className="ltr-num mt-2 select-all font-mono text-2xl font-black tracking-widest text-brand-900" dir="ltr">{code}</p>
            </div>
            <div className="mt-5 flex justify-center">
              <CopyButton text={code} />
            </div>
            <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              ثبت درخواست به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست. نتیجه بررسی پس از طی مراحل لازم اعلام می‌شود.
            </p>
          </>
        ) : (
          <p className="mt-4 leading-8 text-slate-600">
            کد پیگیری در این مرورگر نمایش داده نمی‌شود (مدت نمایش آن کوتاه است). اگر درخواست را ثبت کرده‌اید، با دفتر تماس بگیرید.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/track" icon="track">پیگیری درخواست</ButtonLink>
          <Link href="/" className="rounded-2xl border border-brand-200 px-6 py-3.5 font-bold text-brand-800">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    </section>
  );
}
