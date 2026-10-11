import Link from "next/link";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/primitives";
import { Logo } from "@/components/logo";
import { NAV } from "@/lib/content/site";

export const metadata = {
  title: "صفحه یافت نشد",
  description: "نشانی وارد‌شده وجود ندارد یا صفحه جابه‌جا شده است.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40 dark:opacity-15" aria-hidden />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" aria-hidden />

      <div className="relative w-full max-w-2xl text-center">
        <Logo size={52} className="justify-center" />

        <p className="mt-10 text-[5rem] font-black leading-none text-gradient md:text-[7rem]">۴۰۴</p>
        <h1 className="mt-4 text-2xl font-black text-ink-900 md:text-3xl dark:text-white">این صفحه پیدا نشد</h1>
        <p className="mx-auto mt-4 max-w-lg text-[0.92rem] leading-8 text-ink-600 dark:text-ink-300">
          ممکن است نشانی را اشتباه وارد کرده باشید یا این صفحه جابه‌جا شده باشد. از مسیرهای زیر می‌توانید ادامه دهید.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" icon="home">
            بازگشت به صفحه اصلی
          </ButtonLink>
          <ButtonLink href="/request" variant="outline" icon="send">
            ثبت درخواست
          </ButtonLink>
          <ButtonLink href="/track" variant="ghost" icon="track">
            پیگیری درخواست
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-2 sm:grid-cols-3">
          {NAV.filter((item) => !item.children).slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-[0.8rem] font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200 dark:hover:border-brand-400/40"
            >
              <Icon name={item.icon ?? "dot"} size={17} className="text-brand-600 dark:text-brand-400" />
              {item.label}
              <Icon name="chevronLeft" size={15} className="ms-auto text-ink-300" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
