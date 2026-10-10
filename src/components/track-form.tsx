"use client";

import { useActionState, startTransition, useState } from "react";
import { trackRequestAction, type TrackState } from "@/app/(public)/track/actions";
import { Field, inputClass } from "@/components/field";
import { Alert } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatFaDate, toFaDigits } from "@/lib/utils";
import type { PublicRequestView } from "@/lib/tracking";

const TONE: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  pending_review: "bg-amber-100 text-amber-800",
  needs_info: "bg-orange-100 text-orange-800",
  in_review: "bg-indigo-100 text-indigo-800",
  ready_to_report: "bg-violet-100 text-violet-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function TrackForm() {
  const [state, formAction, pending] = useActionState<TrackState, FormData>(trackRequestAction, null);
  const [code, setCode] = useState("");
  const result: PublicRequestView | null = state?.ok && state.result ? state.result : null;
  const statusKey = result?.status ?? "new";

  return (
    <div className="space-y-6">
      <form
        className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => formAction(fd));
        }}
      >
        <Field label="کد پیگیری" name="trackingCode" required hint="کد را همان‌طور که دریافت کرده‌اید وارد کنید (مثال: K447-XXXXX-XXXXX).">
          <input
            id="trackingCode"
            name="trackingCode"
            required
            dir="ltr"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="K447-XXXXX-XXXXX"
            className={`${inputClass} font-mono tracking-widest text-left`}
          />
        </Field>
        <Field label="چهار رقم آخر شماره تماس ثبت‌شده" name="verification" required hint="برای حفظ حریم خصوصی، این عامل تأیید همراه با کد پیگیری لازم است.">
          <input
            id="verification"
            name="verification"
            required
            inputMode="numeric"
            dir="ltr"
            maxLength={4}
            minLength={4}
            pattern="[0-9۰-۹]{4}"
            autoComplete="off"
            placeholder="####"
            className={`${inputClass} font-mono tracking-widest text-left`}
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-6 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-70"
        >
          <Icon name="search" size={18} /> {pending ? "در حال بررسی…" : "پیگیری درخواست"}
        </button>
      </form>

      {state && !state.ok && state.message && <Alert tone="error">{state.message}</Alert>}

      {result && (
        <article className="space-y-6 rounded-[2rem] border border-brand-200 bg-white p-6 shadow-sm md:p-8" aria-live="polite">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">خدمت</p>
              <h2 className="text-xl font-extrabold">{result.serviceTitle}</h2>
              <p className="ltr-num mt-1 font-mono text-sm text-slate-600" dir="ltr">{result.trackingCode}</p>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-extrabold ${TONE[statusKey]}`}>{result.statusLabel}</span>
          </header>
          <p className="rounded-2xl bg-slate-50 p-4 leading-7 text-slate-700">{result.statusDescription}</p>
          {result.publicNote && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 leading-7 text-brand-900">
              <p className="font-extrabold">توضیح دفتر</p>
              <p className="mt-1 whitespace-pre-line">{result.publicNote}</p>
            </div>
          )}
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">تاریخ ثبت</dt><dd className="font-bold">{formatFaDate(result.createdAt)}</dd></div>
            <div><dt className="text-slate-500">آخرین به‌روزرسانی</dt><dd className="font-bold">{formatFaDate(result.updatedAt)}</dd></div>
            <div><dt className="text-slate-500">تعداد مدارک ثبت‌شده</dt><dd className="font-bold">{toFaDigits(result.attachmentCount)}</dd></div>
          </dl>
          {result.history.length > 0 && (
            <div>
              <h3 className="font-extrabold">سیر وضعیت</h3>
              <ol className="mt-3 space-y-3 border-r-2 border-brand-100 pr-5">
                {result.history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -right-[27px] top-1.5 h-3 w-3 rounded-full bg-brand-600" />
                    <p className="font-bold">{h.statusLabel}</p>
                    <p className="text-xs text-slate-500">{formatFaDate(h.createdAt)}</p>
                    {h.note && <p className="mt-1 text-sm text-slate-600">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="text-xs leading-6 text-slate-500">
            ثبت درخواست به معنی تأیید نهایی یا صدور مجوز نیست. جزئیات شخصی و مدارک فقط برای کارکنان مجاز نمایش داده می‌شود.
          </p>
        </article>
      )}
    </div>
  );
}
