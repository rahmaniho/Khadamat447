"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { submitRequestAction, type RequestActionState } from "@/app/(public)/request/actions";
import { Field, inputClass } from "@/components/field";
import { Icon, type IconName } from "@/components/icons";
import { Alert } from "@/components/ui";
import { Markdown } from "@/components/markdown";

export interface WizardField {
  key: string;
  label: string;
  type: string;
  options: string[];
  placeholder: string;
  helpText: string;
  required: boolean;
}

export interface WizardService {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  allowAttachments: boolean;
  maxAttachments: number;
  documentsMd: string;
  reviewed: boolean;
  fields: WizardField[];
}

export interface WizardConfig {
  maxFileMb: number;
  allowedExtensions: string[];
  retentionText: string;
  privacyText: string;
  contactPhone: string;
}

const STEP_LABELS = ["انتخاب خدمت", "اطلاعات متقاضی", "اطلاعات خدمت", "بررسی و ارسال"];

const STEP_2_KEYS = ["requesterType", "fullName", "phone", "email", "city", "orgName", "preferredContact", "message"];
const STEP_4_KEYS = ["consentAccuracy", "consentPrivacy"];

function newClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

const ICONS: Record<string, IconName> = { card: "card", book: "book", badge: "badge", clipboard: "clipboard", chat: "chat" };

export function RequestWizard({
  services,
  initialService,
  config,
}: {
  services: WizardService[];
  initialService: string;
  config: WizardConfig;
}) {
  const [state, formAction, pending] = useActionState<RequestActionState, FormData>(submitRequestAction, null);
  const [step, setStep] = useState(initialService && services.some((s) => s.slug === initialService) ? 2 : 1);
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [contact, setContact] = useState("phone");
  const [localError, setLocalError] = useState("");
  const [clientId] = useState(newClientId);
  const formRef = useRef<HTMLFormElement>(null);
  const selected = services.find((s) => s.slug === serviceSlug);

  // نمایش خطاهای سرور و بازگشت به مرحله مربوط
  useEffect(() => {
    if (!state || state.ok || !state.errors) return;
    const keys = Object.keys(state.errors);
    if (keys.length === 0) return;
    const first = keys[0];
    let target = 2;
    if (first === "serviceSlug") target = 1;
    else if (STEP_4_KEYS.includes(first)) target = 4;
    else if (STEP_2_KEYS.includes(first)) target = 2;
    else target = 3;
    setStep(target);
    setTimeout(() => {
      document.getElementById(first)?.focus();
    }, 50);
  }, [state]);

  const err = (key: string) => (state && !state.ok && state.errors ? state.errors[key] : undefined);

  function validateCurrentStep(): boolean {
    const form = formRef.current;
    if (!form) return false;
    const container = form.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!container) return true;
    setLocalError("");
    const fields = Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    for (const el of fields) {
      if (el.disabled || el.type === "hidden") continue;
      if (!el.checkValidity()) {
        el.reportValidity();
        el.focus();
        setLocalError("لطفاً موارد مشخص‌شده را تکمیل یا اصلاح کنید.");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (step === 1 && !serviceSlug) {
      setLocalError("لطفاً یک خدمت را انتخاب کنید.");
      return;
    }
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setLocalError("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (!validateCurrentStep()) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby="wizard-status">
      <input type="hidden" name="clientSubmissionId" value={clientId} />
      {/* تله هرزنامه: برای کاربران پنهان است */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          وب‌سایت
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* نوار مراحل */}
      <nav aria-label="مراحل فرم" id="wizard-status">
        <ol className="grid grid-cols-4 gap-2">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition ${
                    done ? "bg-emerald-600 text-white" : active ? "bg-brand-700 text-white ring-4 ring-brand-100" : "bg-slate-200 text-slate-600"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Icon name="check" size={18} /> : n}
                </span>
                <span className={`text-xs font-bold leading-5 ${active ? "text-brand-800" : "text-slate-500"}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        </div>
        <p className="sr-only">مرحله {step} از ۴</p>
      </nav>

      {state && !state.ok && state.message && <Alert tone="error">{state.message}</Alert>}
      {localError && <Alert tone="warning">{localError}</Alert>}

      {/* مرحله ۱: انتخاب خدمت */}
      <fieldset data-step="1" hidden={step !== 1} className="space-y-4">
        <legend className="mb-1 text-xl font-extrabold">۱. خدمت موردنظر را انتخاب کنید</legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="خدمت">
          {services.map((s) => {
            const checked = serviceSlug === s.slug;
            return (
              <label
                key={s.slug}
                className={`relative flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition ${
                  checked ? "border-brand-600 bg-brand-50 shadow-md shadow-brand-700/10" : "border-slate-200 bg-white hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="serviceSlug"
                  id={step === 1 ? "serviceSlug" : undefined}
                  value={s.slug}
                  checked={checked}
                  onChange={() => setServiceSlug(s.slug)}
                  required
                  className="peer sr-only"
                />
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${checked ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"}`}>
                  <Icon name={ICONS[s.icon] ?? "shield"} size={22} />
                </span>
                <span>
                  <span className="block font-extrabold leading-7 text-slate-900">{s.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{s.tagline}</span>
                </span>
                {checked && (
                  <span className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-white">
                    <Icon name="check" size={14} />
                  </span>
                )}
              </label>
            );
          })}
        </div>
        {err("serviceSlug") && <p className="text-sm font-semibold text-rose-700" role="alert">{err("serviceSlug")}</p>}
        <p className="text-xs leading-6 text-slate-500">
          اگر موضوع شما در این فهرست نیست، «سایر درخواست‌ها» را انتخاب کنید.
        </p>
      </fieldset>

      {/* مرحله ۲: اطلاعات متقاضی */}
      <fieldset data-step="2" hidden={step !== 2} className="space-y-6">
        <legend className="mb-1 text-xl font-extrabold">۲. اطلاعات متقاضی</legend>

        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-800">نوع متقاضی <span className="text-rose-600">*</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { v: "person", l: "شخص حقیقی" },
              { v: "company", l: "شخص حقوقی / واحد صنفی" },
            ].map((o) => (
              <label key={o.v} className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                <input type="radio" name="requesterType" value={o.v} required defaultChecked={o.v === "person"} className="h-5 w-5 accent-brand-700" />
                <span className="font-semibold">{o.l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="نام و نام خانوادگی" name="fullName" required error={err("fullName")}>
            <input id="fullName" name="fullName" required minLength={3} maxLength={120} autoComplete="name" className={inputClass} aria-invalid={!!err("fullName")} />
          </Field>
          <Field label="شماره تماس" name="phone" required error={err("phone")} hint="شماره موبایل یا تلفن ثابت با پیش‌شماره، مثال: ۰۹۱۲۱۲۳۴۵۶۷">
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              required
              maxLength={20}
              autoComplete="tel"
              placeholder="09121234567"
              className={`${inputClass} text-left`}
              aria-invalid={!!err("phone")}
            />
          </Field>
          <Field label="نام واحد صنفی یا مجموعه" name="orgName" error={err("orgName")} hint="در صورت ارتباط با درخواست، نام واحد یا مجموعه را وارد کنید.">
            <input id="orgName" name="orgName" maxLength={160} className={inputClass} aria-invalid={!!err("orgName")} />
          </Field>
          <Field label="شهر یا محل فعالیت" name="city" error={err("city")}>
            <input id="city" name="city" maxLength={80} defaultValue="قزوین" className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <Field
              label="ایمیل"
              name="email"
              required={contact === "email"}
              error={err("email")}
              hint={contact === "email" ? "چون روش ارتباطی ایمیل را انتخاب کرده‌اید، ایمیل الزامی است." : "ایمیل اختیاری است و تنها برای اطلاع‌رسانی وضعیت به کار می‌رود."}
            >
              <input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                maxLength={160}
                autoComplete="email"
                required={contact === "email"}
                className={`${inputClass} text-left`}
                aria-invalid={!!err("email")}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-800">روش ترجیحی ارتباط <span className="text-rose-600">*</span></p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { v: "phone", l: "تماس تلفنی" },
              { v: "sms", l: "پیامک" },
              { v: "email", l: "ایمیل" },
            ].map((o) => (
              <label key={o.v} className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                <input
                  type="radio"
                  name="preferredContact"
                  value={o.v}
                  required
                  checked={contact === o.v}
                  onChange={() => setContact(o.v)}
                  className="h-5 w-5 accent-brand-700"
                />
                <span className="font-semibold">{o.l}</span>
              </label>
            ))}
          </div>
          {err("preferredContact") && <p className="text-sm font-semibold text-rose-700">{err("preferredContact")}</p>}
        </div>

        <Field label="توضیحات" name="message" error={err("message")} hint="توضیحات ضروری درباره درخواست (حداکثر ۲۰۰۰ نویسه). اطلاعات پزشکی یا کد ملی را وارد نکنید.">
          <textarea id="message" name="message" rows={4} maxLength={2000} className={inputClass} aria-invalid={!!err("message")} />
        </Field>
      </fieldset>

      {/* مرحله ۳: اطلاعات اختصاصی خدمت */}
      <fieldset data-step="3" hidden={step !== 3} className="space-y-6">
        <legend className="mb-1 text-xl font-extrabold">۳. اطلاعات اختصاصی خدمت</legend>
        {selected ? (
          <>
            <p className="rounded-2xl bg-brand-50 p-4 text-sm font-semibold text-brand-900">خدمت انتخاب‌شده: {selected.title}</p>
            {selected.documentsMd && (
              <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <summary className="cursor-pointer font-bold text-brand-800">
                  راهنمای مدارک{selected.reviewed ? "" : " (در انتظار تأیید نهایی دفتر)"}
                </summary>
                <Markdown source={selected.documentsMd} className="mt-3 text-slate-700" />
              </details>
            )}
            {selected.fields.map((f) => {
              const name = `field_${f.key}`;
              const e = err(f.key);
              return (
                <Field key={f.key} label={f.label} name={name} required={f.required} error={e} hint={f.helpText || undefined}>
                  {f.type === "select" ? (
                    <select id={name} name={name} required={f.required} className={inputClass} defaultValue="" aria-invalid={!!e}>
                      <option value="" disabled={f.required}>انتخاب کنید</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea id={name} name={name} rows={3} required={f.required} maxLength={1000} placeholder={f.placeholder} className={inputClass} aria-invalid={!!e} />
                  ) : (
                    <input
                      id={name}
                      name={name}
                      type={f.type === "number" ? "number" : "text"}
                      inputMode={f.type === "number" ? "numeric" : undefined}
                      min={f.type === "number" ? 1 : undefined}
                      required={f.required}
                      maxLength={200}
                      placeholder={f.placeholder}
                      className={inputClass}
                      aria-invalid={!!e}
                    />
                  )}
                </Field>
              );
            })}

            {selected.allowAttachments && selected.maxAttachments > 0 ? (
              <div className="space-y-3 rounded-3xl border-2 border-dashed border-brand-200 bg-white p-5">
                <div>
                  <label htmlFor="files" className="flex items-center gap-2 font-extrabold text-slate-900">
                    <Icon name="upload" size={20} className="text-brand-700" /> بارگذاری مدارک (اختیاری)
                  </label>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    حداکثر {selected.maxAttachments} فایل، هر فایل حداکثر {config.maxFileMb} مگابایت. قالب‌های مجاز:{" "}
                    <span className="ltr-num">{config.allowedExtensions.join("، ")}</span>. فایل‌ها خصوصی نگهداری می‌شوند و از طریق ایمیل ارسال نمی‌شوند.
                  </p>
                </div>
                <input
                  id="files"
                  name="files"
                  type="file"
                  multiple
                  accept={config.allowedExtensions.join(",")}
                  aria-invalid={!!err("files")}
                  onChange={(ev) => {
                    const files = Array.from(ev.currentTarget.files || []);
                    const tooMany = files.length > selected.maxAttachments;
                    const tooBig = files.find((f) => f.size > config.maxFileMb * 1024 * 1024);
                    if (tooMany) setLocalError(`حداکثر ${selected.maxAttachments} فایل مجاز است.`);
                    else if (tooBig) setLocalError(`حجم «${tooBig.name}» بیش از ${config.maxFileMb} مگابایت است.`);
                    else setLocalError("");
                  }}
                  className="block w-full text-sm file:mr-0 file:ml-4 file:rounded-xl file:border-0 file:bg-brand-700 file:px-4 file:py-2.5 file:font-bold file:text-white hover:file:bg-brand-800"
                />
                {err("files") && <p className="text-sm font-semibold text-rose-700" role="alert">{err("files")}</p>}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-slate-600">ابتدا یک خدمت را انتخاب کنید.</p>
        )}
      </fieldset>

      {/* مرحله ۴: بررسی و رضایت */}
      <fieldset data-step="4" hidden={step !== 4} className="space-y-6">
        <legend className="mb-1 text-xl font-extrabold">۴. تأیید و ارسال</legend>
        <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-8 text-slate-700">
          <p>
            ثبت درخواست صرفاً جمع‌آوری اطلاعات برای آغاز بررسی است و به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست.
          </p>
          <p className="mt-2">{config.retentionText}</p>
          <p className="mt-2">
            برای درخواست حذف یا دریافت نسخه‌ای از اطلاعات خود، با دفتر تماس بگیرید:{" "}
            <span className="ltr-num font-bold">{config.contactPhone || "—"}</span>
          </p>
        </div>

        <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 leading-7 has-[:checked]:border-brand-600">
          <input id="consentAccuracy" type="checkbox" name="consentAccuracy" required className="mt-1 h-5 w-5 shrink-0 accent-brand-700" />
          <span>
            صحت اطلاعات واردشده را تأیید می‌کنم. <span className="text-rose-600">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 leading-7 has-[:checked]:border-brand-600">
          <input id="consentPrivacy" type="checkbox" name="consentPrivacy" required className="mt-1 h-5 w-5 shrink-0 accent-brand-700" />
          <span>
            <a href="/privacy" target="_blank" rel="noopener" className="font-bold text-brand-700 underline">سیاست حفظ حریم خصوصی</a> را خوانده‌ام و می‌پذیرم.
            <span className="text-rose-600"> *</span>
            <span className="mt-1 block text-sm text-slate-600">{config.privacyText}</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-4 leading-7">
          <input type="checkbox" name="consentMarketing" className="mt-1 h-5 w-5 shrink-0 accent-brand-700" />
          <span className="text-sm text-slate-700">
            (اختیاری و جدا از ثبت درخواست) دریافت پیام‌های اطلاع‌رسانی عمومی دفتر را می‌پذیرم. این گزینه از پیش انتخاب نشده و بر رسیدگی به درخواست تأثیری ندارد.
          </span>
        </label>
        {(err("consentAccuracy") || err("consentPrivacy")) && (
          <p className="text-sm font-semibold text-rose-700" role="alert">{err("consentAccuracy") || err("consentPrivacy")}</p>
        )}
      </fieldset>

      {/* ناوبری */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <button
          type="button"
          onClick={back}
          disabled={step === 1 || pending}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3.5 font-bold text-slate-700 disabled:opacity-40"
        >
          <Icon name="arrowRight" size={18} /> مرحله قبل
        </button>
        {step < 4 ? (
          <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-6 py-3.5 font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800">
            مرحله بعد <Icon name="arrowLeft" size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-6 py-3.5 font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "در حال ثبت…" : "ثبت درخواست"} <Icon name="send" size={18} />
          </button>
        )}
      </div>
    </form>
  );
}
