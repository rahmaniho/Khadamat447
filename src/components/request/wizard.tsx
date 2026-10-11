"use client";

/**
 * فرم چندمرحله‌ای ثبت درخواست
 * ---------------------------------------------------------------
 * پنج گام: انتخاب خدمت → اطلاعات متقاضی → جزئیات خدمت → مدارک →
 * بازبینی و ارسال. اعتبارسنجی هر گام پیش از رفتن به گام بعد انجام
 * می‌شود، پیش‌نویس در مرورگر ذخیره می‌شود و در پایان کد پیگیری صادر
 * می‌گردد.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, Checkbox, Chip, Progress } from "@/components/ui";
import { Alert } from "@/components/ui/primitives";
import { Field, FileDrop, Input, RadioGroup, Select, Switch, Textarea, type FilePickerError } from "@/components/ui/form";
import { useStore } from "@/lib/store/store";
import type { Attachment, Channel, NewRequestInput } from "@/lib/store/types";
import { SITE } from "@/lib/content/site";
import { cn } from "@/lib/cn";
import { en, fa, faBytes, isMobile, isValidEmail, normalizePhone } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

const STEPS = [
  { id: 0, title: "انتخاب خدمت", icon: "services", hint: "خدمت موردنظر خود را انتخاب کنید" },
  { id: 1, title: "اطلاعات متقاضی", icon: "user", hint: "راه‌های ارتباطی شما" },
  { id: 2, title: "جزئیات درخواست", icon: "clipboard", hint: "اطلاعات اختصاصی این خدمت" },
  { id: 3, title: "بارگذاری مدارک", icon: "upload", hint: "اختیاری اما بررسی را سریع‌تر می‌کند" },
  { id: 4, title: "بازبینی و ارسال", icon: "check", hint: "کنترل نهایی اطلاعات" },
];

const DRAFT_KEY = "khadamat447.request.draft.v1";

const CONTACT_OPTIONS: Array<{ value: Channel; label: string; description: string }> = [
  { value: "sms", label: "پیامک", description: "به شماره همراه ثبت‌شده" },
  { value: "phone", label: "تماس تلفنی", description: "در ساعات کاری دفتر" },
  { value: "email", label: "ایمیل", description: "اگر ایمیل وارد کرده باشید" },
  { value: "telegram", label: "پیام‌رسان", description: "در صورت فعال بودن کانال" },
];

type Answers = Record<string, string>;

interface Draft {
  serviceSlug: string;
  fullName: string;
  phone: string;
  email: string;
  requesterType: "person" | "company";
  organization: string;
  contactPreference: Channel;
  city: string;
  summary: string;
  answers: Answers;
  consent: boolean;
  newsletter: boolean;
}

const EMPTY_DRAFT: Draft = {
  serviceSlug: "",
  fullName: "",
  phone: "",
  email: "",
  requesterType: "person",
  organization: "",
  contactPreference: "sms",
  city: "قزوین",
  summary: "",
  answers: {},
  consent: false,
  newsletter: false,
};

export function RequestWizard({ initialService = "" }: { initialService?: string }) {
  const router = useRouter();
  const { addRequest, toast, state } = useStore();
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY_DRAFT, serviceSlug: initialService });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileErrors, setFileErrors] = useState<FilePickerError[]>([]);
  const [restored, setRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeServices = useMemo(() => state.services.filter((s) => s.active), [state.services]);
  const service = useMemo(
    () => activeServices.find((s) => s.slug === draft.serviceSlug),
    [activeServices, draft.serviceSlug],
  );

  /* ------------------------- پیش‌نویس ------------------------- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { draft?: Draft; files?: Attachment[]; step?: number };
      if (parsed.draft?.fullName || parsed.draft?.serviceSlug) {
        setDraft((prev) => ({ ...prev, ...parsed.draft }));
        setFiles(parsed.files ?? []);
        setRestored(true);
      }
    } catch {
      /* بی‌صدا */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, files, step }));
      } catch {
        /* حافظه پر */
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draft, files, step]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  const setAnswer = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /* ------------------------- اعتبارسنجی ------------------------- */
  const validate = (target: number): boolean => {
    const next: Record<string, string> = {};
    if (target > 0 && !draft.serviceSlug) next.serviceSlug = "یک خدمت را انتخاب کنید.";
    if (target > 1) {
      if (!draft.fullName.trim() || draft.fullName.trim().length < 3) next.fullName = "نام و نام خانوادگی را کامل وارد کنید.";
      if (!isMobile(draft.phone)) next.phone = "شماره همراه معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹";
      if (draft.email && !isValidEmail(draft.email)) next.email = "قالب ایمیل صحیح نیست.";
      if (draft.requesterType === "company" && !draft.organization.trim())
        next.organization = "نام واحد صنفی یا سازمان را وارد کنید.";
    }
    if (target > 2 && service) {
      for (const field of service.fields) {
        if (!field.required) continue;
        const value = (draft.answers[field.key] ?? "").trim();
        if (!value) next[field.key] = `«${field.label}» الزامی است.`;
      }
    }
    if (target > 3) {
      if (!draft.summary.trim() || draft.summary.trim().length < 10)
        next.summary = "توضیح کوتاهی درباره درخواست بنویسید (حداقل ۱۰ نویسه).";
      if (!draft.consent) next.consent = "برای ادامه، تأیید مطالعه شرایط و حریم خصوصی لازم است.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.warning("تکمیل اطلاعات لازم است", "موارد مشخص‌شده را اصلاح کنید.");
      const firstKey = Object.keys(next)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validate(step + 1)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------- فایل‌ها ------------------------- */
  const accept = ".pdf,.jpg,.jpeg,.png,.webp";
  const maxSize = (state.settings.maxFileMb ?? 5) * 1024 * 1024;
  const maxFiles = service?.maxAttachments ?? state.settings.maxFiles ?? 4;

  const handleFiles = (incoming: File[]) => {
    const problems: FilePickerError[] = [];
    const accepted: Attachment[] = [];
    let count = files.length;

    for (const file of incoming) {
      const ext = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
      if (!accept.split(",").includes(ext)) {
        problems.push({ name: file.name, reason: `قالب مجاز نیست (${accept})` });
        continue;
      }
      if (file.size > maxSize) {
        problems.push({ name: file.name, reason: `حجم بیش از ${faBytes(maxSize)}` });
        continue;
      }
      if (count >= maxFiles) {
        problems.push({ name: file.name, reason: `حداکثر ${fa(maxFiles)} فایل مجاز است` });
        continue;
      }
      count += 1;
      accepted.push({
        id: `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        ext,
        uploadedAt: new Date().toISOString(),
        verified: false,
      });
    }

    setFileErrors(problems);
    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted]);
      // پیش‌نمایش تصویر کوچک (فقط برای فایل‌های سبک)
      accepted.forEach((attachment, index) => {
        const file = incoming.filter((f) => f.name === attachment.name)[index] ?? incoming[0];
        if (!file.type.startsWith("image/") || file.size > 400_000) return;
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === "string" ? reader.result : null;
          if (!result) return;
          setFiles((prev) => prev.map((f) => (f.id === attachment.id ? { ...f, preview: result } : f)));
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${fa(accepted.length)} فایل افزوده شد`);
    }
    if (problems.length) toast.error("برخی فایل‌ها پذیرفته نشد", `${fa(problems.length)} مورد رد شد.`);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  /* ------------------------- ارسال ------------------------- */
  const submit = () => {
    if (!validate(4)) return;
    if (!service) return;
    setSubmitting(true);

    const answers = [
      { key: "summary_note", label: "توضیح متقاضی", value: draft.summary.trim() },
      ...Object.entries(draft.answers)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => ({
          key,
          label: service.fields.find((f) => f.key === key)?.label ?? key,
          value: value.trim(),
        })),
    ];

    const input: NewRequestInput = {
      serviceSlug: service.slug,
      fullName: draft.fullName.trim(),
      phone: normalizePhone(draft.phone),
      email: draft.email.trim(),
      requesterType: draft.requesterType,
      organization: draft.organization.trim(),
      contactPreference: draft.contactPreference,
      city: draft.city.trim() || "قزوین",
      summary: draft.summary.trim(),
      answers,
      attachments: files,
      consent: draft.consent,
      newsletter: draft.newsletter,
    };

    const record = addRequest(input);
    if (!record) {
      setSubmitting(false);
      return;
    }
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* بی‌صدا */
    }
    toast.success("درخواست ثبت شد", `کد پیگیری: ${record.trackingCode}`);
    router.push(`/request/success?code=${record.trackingCode}`);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      {/* ستون فرم */}
      <div className="space-y-6">
        {/* نشانگر گام‌ها */}
        <div className="surface-card p-5">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-[0.74rem] font-black transition-all",
                      active
                        ? "bg-brand-600 text-white shadow-glow"
                        : done
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-200"
                          : "text-ink-400 dark:text-ink-500",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[0.66rem]",
                        active ? "bg-white/20" : done ? "bg-brand-600 text-white" : "bg-ink-100 dark:bg-white/10",
                      )}
                    >
                      {done ? <Icon name="check" size={12} strokeWidth={3} /> : toFaDigits(i + 1)}
                    </span>
                    <span className="hidden whitespace-nowrap sm:inline">{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className={cn("h-px flex-1", done ? "bg-brand-400" : "bg-[var(--border-soft)]")} aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Progress value={progress} size="sm" />
            <p className="mt-2 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
              گام {toFaDigits(step + 1)} از {toFaDigits(STEPS.length)} — {STEPS[step].hint}
            </p>
          </div>
        </div>

        {restored && step > 0 && (
          <Alert tone="info" title="پیش‌نویس بازیابی شد">
            اطلاعات وارد‌شده قبلی شما در این مرورگر ذخیره بوده و بازیابی شد.{" "}
            <button
              type="button"
              className="font-black underline"
              onClick={() => {
                setDraft({ ...EMPTY_DRAFT });
                setFiles([]);
                setRestored(false);
                setStep(0);
              }}
            >
              شروع از ابتدا
            </button>
          </Alert>
        )}

        {/* گام ۱: انتخاب خدمت */}
        {step === 0 && (
          <Card className="animate-fade-up">
            <h2 className="text-lg font-black text-ink-900 dark:text-white">کدام خدمت را می‌خواهید؟</h2>
            <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
              با انتخاب خدمت، فرم اختصاصی و فهرست مدارک مرتبط نمایش داده می‌شود.
            </p>
            {errors.serviceSlug && <p className="mt-2 text-[0.74rem] font-bold text-rose-600">{errors.serviceSlug}</p>}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {activeServices.map((item) => {
                const active = draft.serviceSlug === item.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      set("serviceSlug", item.slug);
                      setDraft((prev) => ({ ...prev, serviceSlug: item.slug, answers: {} }));
                    }}
                    className={cn(
                      "group flex items-start gap-3 rounded-3xl border p-4 text-start transition-all duration-300",
                      active
                        ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20 dark:border-brand-400/60 dark:bg-brand-500/10"
                        : "border-[var(--border-soft)] bg-[var(--surface)] hover:border-brand-300 hover:shadow-soft dark:hover:border-brand-400/40",
                    )}
                  >
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white", item.gradient)}>
                      <Icon name={item.icon} size={21} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[0.86rem] font-black text-ink-900 dark:text-white">{item.title}</span>
                        {item.popular && <Badge tone="gold" size="sm">پرمراجعه</Badge>}
                      </span>
                      <span className="mt-1 block text-[0.74rem] leading-6 text-ink-500 dark:text-ink-400">{item.tagline}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
                        <span className="flex items-center gap-1">
                          <Icon name="clock" size={12} />
                          {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="clipboard" size={12} />
                          {toFaDigits(item.fields.length)} فیلد
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="upload" size={12} />
                          تا {toFaDigits(item.maxAttachments)} فایل
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "ms-auto grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
                        active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 dark:border-white/20",
                      )}
                    >
                      {active && <Icon name="check" size={12} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* گام ۲: اطلاعات متقاضی */}
        {step === 1 && (
          <Card className="animate-fade-up">
            <h2 className="text-lg font-black text-ink-900 dark:text-white">اطلاعات متقاضی</h2>
            <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
              شماره همراه برای پیگیری و اطلاع‌رسانی استفاده می‌شود. کد ملی دریافت نمی‌شود.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div id="field-fullName">
                <Input
                  label="نام و نام خانوادگی"
                  required
                  value={draft.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="مثلاً: رضا محمدی"
                  error={errors.fullName}
                  icon="user"
                />
              </div>
              <div id="field-phone">
                <Input
                  label="شماره همراه"
                  required
                  type="tel"
                  numeric
                  inputMode="tel"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  error={errors.phone}
                  icon="phone"
                  className="text-start"
                  dir="ltr"
                />
              </div>
              <div id="field-email" className="sm:col-span-2">
                <Input
                  label="ایمیل"
                  type="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="برای دریافت پیام‌های ایمیلی (اختیاری)"
                  error={errors.email}
                  icon="mail"
                  dir="ltr"
                  className="text-start"
                />
              </div>
              <div id="field-requesterType" className="sm:col-span-2">
                <RadioGroup
                  label="نوع متقاضی"
                  columns={2}
                  value={draft.requesterType}
                  onChange={(value) => set("requesterType", value as Draft["requesterType"])}
                  options={[
                    { value: "person", label: "شخص حقیقی", description: "درخواست شخصی" },
                    { value: "company", label: "شخص حقوقی / واحد صنفی", description: "درخواست برای یک کسب‌وکار" },
                  ]}
                />
              </div>
              {draft.requesterType === "company" && (
                <div id="field-organization" className="sm:col-span-2">
                  <Input
                    label="نام واحد صنفی یا سازمان"
                    required
                    value={draft.organization}
                    onChange={(e) => set("organization", e.target.value)}
                    placeholder="مثلاً: رستوران نمونه"
                    error={errors.organization}
                    icon="building"
                  />
                </div>
              )}
              <div>
                <Input
                  label="شهر"
                  value={draft.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="قزوین"
                  icon="pin"
                />
              </div>
              <div>
                <Select
                  label="روش ارتباط ترجیحی"
                  value={draft.contactPreference}
                  onChange={(e) => set("contactPreference", e.target.value as Channel)}
                  options={CONTACT_OPTIONS.map((o) => ({ value: o.value, label: `${o.label} — ${o.description}` }))}
                />
              </div>
            </div>
          </Card>
        )}

        {/* گام ۳: جزئیات خدمت */}
        {step === 2 && service && (
          <Card className="animate-fade-up">
            <div className="flex items-center gap-3">
              <span className={cn("grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white", service.gradient)}>
                <Icon name={service.icon} size={23} />
              </span>
              <div>
                <h2 className="text-lg font-black text-ink-900 dark:text-white">{service.title}</h2>
                <p className="text-[0.76rem] text-ink-500 dark:text-ink-400">{service.tagline}</p>
              </div>
            </div>

            <Alert tone="brand" className="mt-5">
              {service.highlights[0] ?? "اطلاعات این بخش بر اساس خدمت انتخابی نمایش داده می‌شود."} — اگر مدرکی در اختیار
              ندارید، می‌توانید بدون فایل ادامه دهید.
            </Alert>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {service.fields.map((field) => {
                const value = draft.answers[field.key] ?? "";
                const error = errors[field.key];
                const common = { label: field.label, help: field.help, error, required: field.required };
                if (field.type === "select") {
                  return (
                    <div key={field.key} id={`field-${field.key}`} className={field.options && field.options.length > 4 ? "sm:col-span-2" : ""}>
                      <Select
                        {...common}
                        placeholder="یک گزینه را انتخاب کنید"
                        value={value}
                        onChange={(e) => setAnswer(field.key, e.target.value)}
                        options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
                      />
                    </div>
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <div key={field.key} id={`field-${field.key}`} className="sm:col-span-2">
                      <Textarea
                        {...common}
                        rows={3}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => setAnswer(field.key, e.target.value)}
                      />
                    </div>
                  );
                }
                if (field.type === "number") {
                  return (
                    <div key={field.key} id={`field-${field.key}`}>
                      <Input
                        {...common}
                        numeric
                        inputMode="numeric"
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => setAnswer(field.key, en(e.target.value))}
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.key} id={`field-${field.key}`}>
                    <Input
                      {...common}
                      type={field.type === "date" ? "date" : "text"}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* گام ۴: مدارک */}
        {step === 3 && (
          <Card className="animate-fade-up">
            <h2 className="text-lg font-black text-ink-900 dark:text-white">بارگذاری مدارک (اختیاری)</h2>
            <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
              می‌توانید مدارک را همین حالا بارگذاری کنید یا درخواست را بدون فایل ارسال کنید؛ کارشناس دفتر در مرحله بررسی
              موارد لازم را اعلام می‌کند.
            </p>

            <div className="mt-5">
              <FileDrop
                onFiles={handleFiles}
                accept={accept}
                maxSizeMb={state.settings.maxFileMb ?? 5}
                maxFiles={maxFiles}
                currentCount={files.length}
                errors={fileErrors}
              />
            </div>

            {files.length > 0 && (
              <ul className="mt-5 space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-3"
                  >
                    {file.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.preview} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-700 dark:bg-white/8 dark:text-brand-300">
                        <Icon name={file.ext === ".pdf" ? "file" : "image"} size={22} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.82rem] font-bold text-ink-800 dark:text-ink-100">{file.name}</p>
                      <p className="text-[0.68rem] font-medium text-ink-500 dark:text-ink-400">
                        {faBytes(file.size)} · {file.ext.replace(".", "").toUpperCase()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="grid h-9 w-9 place-items-center rounded-xl text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      aria-label={`حذف ${file.name}`}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Alert tone="info" className="mt-5" icon="lock" title="درباره امنیت فایل‌ها">
              در این نسخه نمایشی، فایل‌ها به سرور ارسال نمی‌شوند و فقط نام و مشخصات آن‌ها در مرورگر شما نگه‌داری می‌شود.
            </Alert>
          </Card>
        )}

        {/* گام ۵: بازبینی */}
        {step === 4 && service && (
          <div className="space-y-6">
            <Card className="animate-fade-up">
              <h2 className="text-lg font-black text-ink-900 dark:text-white">بازبینی نهایی</h2>
              <p className="mt-1.5 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
                اطلاعات زیر را کنترل کنید؛ پس از ارسال، امکان ویرایش از طریق کد پیگیری و تماس با دفتر وجود دارد.
              </p>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "خدمت", value: service.title, icon: service.icon },
                  { label: "نام متقاضی", value: draft.fullName, icon: "user" },
                  { label: "شماره همراه", value: toFaDigits(normalizePhone(draft.phone)), icon: "phone" },
                  { label: "نوع متقاضی", value: draft.requesterType === "company" ? "شخص حقوقی / واحد صنفی" : "شخص حقیقی", icon: "building" },
                  ...(draft.organization ? [{ label: "واحد صنفی", value: draft.organization, icon: "building" }] : []),
                  ...(draft.email ? [{ label: "ایمیل", value: draft.email, icon: "mail" }] : []),
                  { label: "شهر", value: draft.city || "قزوین", icon: "pin" },
                  {
                    label: "روش ارتباط ترجیحی",
                    value: CONTACT_OPTIONS.find((o) => o.value === draft.contactPreference)?.label ?? "—",
                    icon: "chat",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] p-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      <Icon name={row.icon} size={17} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">{row.label}</dt>
                      <dd className="truncate text-[0.82rem] font-black text-ink-900 dark:text-white">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {Object.keys(draft.answers).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-[0.86rem] font-black text-ink-900 dark:text-white">جزئیات خدمت</h3>
                  <ul className="mt-3 space-y-2">
                    {service.fields
                      .filter((f) => (draft.answers[f.key] ?? "").trim())
                      .map((f) => (
                        <li key={f.key} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-2.5">
                          <span className="text-[0.74rem] font-bold text-ink-500 dark:text-ink-400">{f.label}</span>
                          <span className="text-[0.8rem] font-black text-ink-800 dark:text-ink-100">{draft.answers[f.key]}</span>
                        </li>
                      ))}
                    {files.length > 0 && (
                      <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-2.5">
                        <span className="text-[0.74rem] font-bold text-ink-500 dark:text-ink-400">مدارک پیوست</span>
                        <span className="text-[0.8rem] font-black text-ink-800 dark:text-ink-100">
                          {toFaDigits(files.length)} فایل
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="animate-fade-up">
              <Textarea
                id="field-summary"
                label="توضیح درخواست"
                required
                rows={4}
                value={draft.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="در چند جمله بنویسید چه چیزی لازم دارید؛ هر جزئیات بیشتر، بررسی را سریع‌تر می‌کند."
                error={errors.summary}
                help="این متن برای کارشناس دفتر نمایش داده می‌شود و در صفحه پیگیری نیز قابل مشاهده است."
              />

              <div className="mt-5 space-y-4">
                <div id="field-consent">
                  <Checkbox
                    checked={draft.consent}
                    onChange={(checked) => set("consent", checked)}
                    label="صحت اطلاعات وارد‌شده را تأیید می‌کنم و شرایط استفاده و حریم خصوصی را خوانده‌ام."
                    description={
                      <>
                        متن کامل در صفحه‌های{" "}
                        <Link href="/terms" className="font-bold text-brand-700 underline dark:text-brand-300">
                          شرایط استفاده
                        </Link>{" "}
                        و{" "}
                        <Link href="/privacy" className="font-bold text-brand-700 underline dark:text-brand-300">
                          حریم خصوصی
                        </Link>{" "}
                        آمده است.
                      </>
                    }
                    error={errors.consent}
                  />
                </div>

                <Switch
                  checked={draft.newsletter}
                  onChange={(checked) => set("newsletter", checked)}
                  label="اطلاع‌رسانی دوره‌ها و به‌روزرسانی راهنماها"
                  description="اختیاری — تنها پیام‌های مرتبط با خدمات و زمان برگزاری دوره‌ها ارسال می‌شود."
                />

                <Switch
                  checked={draft.serviceSlug !== "other"}
                  onChange={function () {
                    /* این گزینه صرفاً نمایشی است */
                  }}
                  label="درخواست از طریق مشخصات ثبت‌شده"
                  description={`ارسال این درخواست به‌عنوان «${service.title}»`}
                  disabled
                />
              </div>
            </Card>
          </div>
        )}

        {/* کنترل‌های حرکت */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" icon="arrowRight" onClick={goBack} disabled={step === 0}>
            گام قبلی
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/services"
              className="rounded-2xl px-4 py-2.5 text-[0.78rem] font-bold text-ink-500 transition hover:text-brand-700 dark:text-ink-400"
            >
              مشاهده توضیح خدمات
            </Link>
            {step < STEPS.length - 1 ? (
              <Button iconEnd="arrowLeft" onClick={goNext}>
                گام بعدی
              </Button>
            ) : (
              <Button icon="send" onClick={submit} loading={submitting} size="lg">
                ارسال نهایی درخواست
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ستون کنار: خلاصه و راهنما */}
      <aside className="space-y-4 lg:sticky lg:top-28">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="inbox" size={21} />
            </span>
            <div>
              <h2 className="font-black text-ink-900 dark:text-white">خلاصه درخواست</h2>
              <p className="text-[0.7rem] text-ink-500 dark:text-ink-400">همیشه در دسترس شما</p>
            </div>
          </div>

          <dl className="space-y-2 text-[0.78rem]">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
              <dt className="font-bold text-ink-500 dark:text-ink-400">خدمت</dt>
              <dd className="truncate font-black text-ink-800 dark:text-ink-100">{service?.title ?? "انتخاب نشده"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
              <dt className="font-bold text-ink-500 dark:text-ink-400">نام</dt>
              <dd className="truncate font-black text-ink-800 dark:text-ink-100">{draft.fullName || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
              <dt className="font-bold text-ink-500 dark:text-ink-400">تماس</dt>
              <dd className="numeric truncate font-black text-ink-800 dark:text-ink-100">
                {draft.phone ? toFaDigits(draft.phone) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 px-3 py-2">
              <dt className="font-bold text-ink-500 dark:text-ink-400">مدارک</dt>
              <dd className="font-black text-ink-800 dark:text-ink-100">{toFaDigits(files.length)} فایل</dd>
            </div>
          </dl>

          {service && (
            <div className="rounded-2xl border border-[var(--border-soft)] p-3.5">
              <p className="text-[0.72rem] font-black text-ink-700 dark:text-ink-200">مدارک معمول این خدمت</p>
              <div className="prose-fa mt-1 text-[0.74rem] leading-6">
                {service.deliverables.slice(0, 3).map((d) => (
                  <p key={d} className="flex items-start gap-1.5">
                    <Icon name="check" size={13} className="mt-1.5 shrink-0 text-brand-600" />
                    {d}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Chip icon="clock">{service?.duration ?? "۱ تا ۳ روز کاری"}</Chip>
            <Chip icon="lock">مدارک خصوصی</Chip>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="chat" size={18} className="text-brand-600 dark:text-brand-400" />
            نیاز به راهنمایی دارید؟
          </h3>
          <p className="text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">
            در ساعات کاری می‌توانید تلفنی راهنمایی بگیرید یا پرسش خود را از فرم «سایر درخواست‌ها» ارسال کنید.
          </p>
          <div className="space-y-2">
            {SITE.phones.map((phone) => (
              <a
                key={phone.value}
                href={`tel:${phone.value}`}
                className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-[0.78rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
              >
                <Icon name="phone" size={16} className="text-brand-600 dark:text-brand-400" />
                <span className="numeric">{toFaDigits(phone.display)}</span>
              </a>
            ))}
          </div>
          <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">{SITE.hoursSummary}</p>
        </Card>

        <Alert tone="warning" icon="alert" title="توجه">
          ثبت درخواست در این سامانه به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست؛ نتیجه پس از بررسی
          کارشناسی اعلام می‌شود.
        </Alert>
      </aside>
    </div>
  );
}
