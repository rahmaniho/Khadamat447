"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Alert, Button, Card, EmptyState, Kbd } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { RequestStatusCard } from "@/components/track/status-view";
import { useStore } from "@/lib/store/store";
import type { RequestRecord } from "@/lib/store/types";
import { normalizePhone, phoneLast4 } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";
import type { DemoHint } from "@/lib/store/hints";

export function TrackPanel({ initialCode = "", demoHints = [] }: { initialCode?: string; demoHints?: DemoHint[] }) {
  const { requestByCode, rememberRequest, setRating, toast, ready } = useStore();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<RequestRecord | null>(null);
  const [attempted, setAttempted] = useState(false);

  const lookup = (searchCode: string, searchPhone: string) => {
    setAttempted(true);
    const value = searchCode.trim().toUpperCase().replace(/\s/g, "");
    if (!value) {
      setError("کد پیگیری را وارد کنید.");
      setFound(null);
      return;
    }
    const request = requestByCode(value);
    if (!request) {
      setError("درخواستی با این کد پیگیری یافت نشد. قالب کد مانند K447-ABCDE-FGHIJ است.");
      setFound(null);
      return;
    }
    const last4 = phoneLast4(searchPhone);
    if (last4 && last4 !== phoneLast4(request.phone)) {
      setError("چهار رقم آخر شماره تماس با اطلاعات این درخواست مطابقت ندارد.");
      setFound(null);
      return;
    }
    setError(null);
    setFound(request);
    rememberRequest(request.trackingCode);
  };

  /* اگر کد از نشانی صفحه آمده باشد، همان لحظه جست‌وجو می‌شود */
  useEffect(() => {
    if (initialCode && ready) lookup(initialCode, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, ready]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(code, phone);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <Card className="lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="search" size={21} />
            </span>
            <div>
              <h2 className="font-black text-ink-900 dark:text-white">جست‌وجوی درخواست</h2>
              <p className="text-[0.72rem] text-ink-500 dark:text-ink-400">با کد پیگیری و شماره تماس</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Input
              label="کد پیگیری"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="K447-ABCDE-FGHIJ"
              dir="ltr"
              className="text-start tracking-wider"
              error={error ?? undefined}
              help="کد پیگیری پس از ثبت درخواست به شما نمایش داده شده است."
            />
            <Input
              label="چهار رقم آخر شماره تماس"
              numeric
              inputMode="numeric"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۴۵۶۷"
              className="text-start"
              help="برای امنیت بیشتر؛ خالی گذاشتن این فیلد هم پذیرفته می‌شود."
            />
            <Button type="submit" icon="search" full>
              نمایش وضعیت
            </Button>
          </form>

          {demoHints.length > 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-3.5 dark:border-brand-400/25 dark:bg-brand-500/5">
              <p className="flex items-center gap-1.5 text-[0.72rem] font-black text-brand-800 dark:text-brand-200">
                <Icon name="sparkles" size={14} />
                کدهای نمونه این نسخه نمایشی
              </p>
              <ul className="mt-2 space-y-1.5">
                {demoHints.map((hint) => (
                  <li key={hint.code} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.68rem] font-bold text-ink-600 dark:text-ink-300">{hint.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCode(hint.code);
                        setPhone(hint.phone);
                        lookup(hint.code, hint.phone);
                      }}
                      className="numeric rounded-lg bg-white px-2 py-1 text-[0.66rem] font-black text-brand-700 shadow-soft transition hover:bg-brand-100 dark:bg-white/10 dark:text-brand-200"
                      dir="ltr"
                    >
                      {hint.code}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-[0.7rem] leading-6 text-ink-500 dark:text-ink-400">
            کد پیگیری را گم کرده‌اید؟{" "}
            <Link href="/my-requests" className="font-black text-brand-700 hover:underline dark:text-brand-300">
              کارتابل من
            </Link>{" "}
            را ببینید یا با <Kbd>۰۹۳۹۸۵۲۰۱۵۰</Kbd> تماس بگیرید.
          </p>
        </Card>

        <div>
          {found ? (
            <RequestStatusCard request={found} onRate={(rating) => {
              setRating(found.id, rating);
              toast.success("از ثبت نظر شما سپاسگزاریم", `امتیاز ${toFaDigits(rating)} از ۵ ثبت شد.`);
              setFound({ ...found, rating });
            }} />
          ) : attempted && !error ? null : (
            <EmptyState
              icon="track"
              title={error ? "درخواستی پیدا نشد" : "منتظر جست‌وجوی شما هستیم"}
              description={
                error
                  ? "کد پیگیری را کنترل کنید. قالب درست کد به شکل K447-ABCDE-FGHIJ است. اگر درخواست تازه ثبت شده، چند لحظه بعد دوباره تلاش کنید."
                  : "کد پیگیری را از فرم کنار وارد کنید تا وضعیت، رویدادها و مدارک درخواست خود را ببینید."
              }
              action={
                <Link
                  href="/request"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-4 py-2.5 text-[0.8rem] font-black text-white transition hover:bg-brand-700"
                >
                  <Icon name="send" size={16} />
                  ثبت درخواست جدید
                </Link>
              }
            />
          )}

          {error && (
            <Alert tone="danger" className="mt-4" title="بررسی ناموفق">
              {error}
            </Alert>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: "lock", title: "دسترسی امن", text: "ترکیب کد پیگیری و شماره تماس، دسترسی به درخواست را محدود می‌کند." },
          { icon: "bell", title: "اطلاع‌رسانی خودکار", text: "در هر تغییر وضعیت، پیام اطلاع‌رسانی برای شما آماده می‌شود." },
          { icon: "clock", title: "به‌روزرسانی لحظه‌ای", text: "خط زمان، همه رویدادهای عمومی درخواست را نشان می‌دهد." },
        ].map((item) => (
          <div key={item.title} className="surface-card flex gap-3 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name={item.icon} size={19} />
            </span>
            <div>
              <p className="font-black text-ink-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-[0.76rem] leading-6 text-ink-600 dark:text-ink-300">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
