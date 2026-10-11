"use client";

/**
 * ورود به پیشخوان مدیریت (نسخه نمایشی)
 * ---------------------------------------------------------------
 * نشست در مرورگر ذخیره می‌شود؛ حساب‌های نمایشی با نقش‌های مختلف
 * برای بررسی سطوح دسترسی در دسترس است.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Alert, Badge, Button, Card } from "@/components/ui/primitives";
import { Input } from "@/components/ui/form";
import { useTheme } from "@/components/layout/theme-provider";
import { useStore } from "@/lib/store/store";
import { DEMO_CREDENTIALS } from "@/lib/store/seed";
import { ROLE_META } from "@/lib/store/types";
import { toFaDigits } from "@/lib/digits";

const QUICK_USERS = [
  { email: "admin@khadamat447.ir", label: "مدیر کل", role: "owner" },
  { email: "reviewer@khadamat447.ir", label: "کارشناس بررسی", role: "reviewer" },
  { email: "content@khadamat447.ir", label: "مدیر محتوا", role: "content" },
  { email: "support@khadamat447.ir", label: "پشتیبانی", role: "support" },
] as const;

export function AdminLogin() {
  const { login, toast } = useStore();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      toast.error("ورود ناموفق", result.message);
      return;
    }
    setError("");
    toast.success("خوش آمدید", "به پیشخوان مدیریت وارد شدید.");
    router.replace("/admin");
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-[var(--page-bg)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.35]" aria-hidden />
      <div className="pointer-events-none absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 end-1/4 h-72 w-72 rounded-full bg-gold-300/20 blur-3xl" aria-hidden />

      <div className="relative w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-4xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-lift lg:grid-cols-[1.05fr_1fr]">
          {/* ستون معرفی */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 text-white lg:flex">
            <div className="absolute inset-0 opacity-[0.12] dot-pattern" aria-hidden />
            <div className="relative">
              <Logo size={44} light />
              <h1 className="mt-8 text-2xl font-black leading-relaxed">
                پیشخوان مدیریت
                <br />
                دفتر خدمات سلامت ۴۷۷
              </h1>
              <p className="mt-4 max-w-sm text-[0.84rem] leading-8 text-white/80">
                همه امکانات سامانه به‌صورت فعال در دسترس است: کارتابل درخواست‌ها، مدیریت مدارک، محتوا، اعلان‌ها، کاربران و
                گزارش‌های آماری — بدون نیاز به راه‌اندازی سرور.
              </p>
              <ul className="mt-6 space-y-3 text-[0.8rem] font-bold text-white/90">
                {[
                  "پیگیری زنده وضعیت درخواست‌ها و سابقه رویدادها",
                  "کنترل دسترسی نقش‌محور با چهار نقش کاری",
                  "صف اعلان‌ها با تلاش مجدد و ارسال آزمایشی",
                  "گزارش‌های آماری و نمودارهای تعاملی",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon name="checkCircle" size={17} className="mt-0.5 shrink-0 text-brand-200" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-8 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-[0.72rem] font-black text-white/80">
                <Icon name="sparkles" size={14} />
                دسترسی سریع با نقش‌های نمونه
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {QUICK_USERS.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(DEMO_CREDENTIALS.password);
                      setError("");
                    }}
                    className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-start text-[0.72rem] font-bold transition hover:bg-white/15"
                  >
                    <span className="block">{user.label}</span>
                    <span className="mt-0.5 block text-[0.62rem] text-white/60" dir="ltr">
                      {user.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ستون فرم */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="lg:hidden">
                <Logo size={40} />
              </div>
              <div className="ms-auto flex items-center gap-2">
                <Badge tone="brand" icon="sparkles" size="sm">
                  نسخه نمایشی فعال
                </Badge>
                <button
                  type="button"
                  onClick={toggle}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-500 transition hover:text-brand-700 dark:text-ink-400"
                  aria-label="تغییر حالت روشن و تاریک"
                >
                  <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
                </button>
              </div>
            </div>

            <h2 className="mt-6 text-xl font-black text-ink-900 dark:text-white">ورود به حساب</h2>
            <p className="mt-1.5 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
              اطلاعات ورود نمایشی از پیش پر شده است؛ می‌توانید نقش دیگری را هم انتخاب کنید.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <Input
                label="ایمیل"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@khadamat447.ir"
                icon="mail"
                dir="ltr"
                className="text-start"
                required
              />

              <div className="relative">
                <Input
                  label="گذرواژه"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  icon="lock"
                  dir="ltr"
                  className="text-start"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute bottom-3 end-3 grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition hover:text-brand-700 dark:hover:text-brand-300"
                  aria-label={showPassword ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>

              {error && (
                <Alert tone="danger" icon="alertCircle">
                  {error}
                </Alert>
              )}

              <Button type="submit" icon="logout" loading={loading} full size="lg">
                ورود به پیشخوان
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 p-4">
                <p className="flex items-center gap-2 text-[0.72rem] font-black text-ink-700 dark:text-ink-200">
                  <Icon name="info" size={14} className="text-brand-600 dark:text-brand-400" />
                  اطلاعات ورود نمایشی
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="slate" size="sm" className="numeric" dir="ltr">
                    {DEMO_CREDENTIALS.email}
                  </Badge>
                  <Badge tone="slate" size="sm" className="numeric" dir="ltr">
                    {DEMO_CREDENTIALS.password}
                  </Badge>
                </div>
                <p className="mt-2.5 text-[0.68rem] leading-6 text-ink-500 dark:text-ink-400">
                  رمز همه نقش‌های نمونه <span className="numeric">{DEMO_CREDENTIALS.password}</span> است. تغییرات شما فقط در
                  همین مرورگر ذخیره می‌شود.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {QUICK_USERS.slice(0, 2).map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(DEMO_CREDENTIALS.password);
                      setError("");
                    }}
                    className="rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-start text-[0.72rem] font-bold text-ink-700 transition hover:border-brand-300 lg:hidden dark:text-ink-200"
                  >
                    ورود به‌عنوان {user.label}
                    <span className="mt-0.5 block text-[0.62rem] font-bold text-ink-400">
                      {ROLE_META[user.role].label} — {toFaDigits(DEMO_CREDENTIALS.password)}
                    </span>
                  </button>
                ))}
              </div>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-[0.76rem] font-black text-brand-700 transition hover:underline dark:text-brand-300"
              >
                <Icon name="home" size={15} />
                بازگشت به سایت اصلی
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[0.68rem] font-bold text-ink-400 dark:text-ink-500">
          این پیشخوان نسخه نمایشی است؛ داده‌ها در مرورگر شما نگه‌داری می‌شود و به سروری ارسال نمی‌گردد.
        </p>
      </div>
    </div>
  );
}
