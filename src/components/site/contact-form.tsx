"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Button, Card } from "@/components/ui";
import { Alert } from "@/components/ui/primitives";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { useStore } from "@/lib/store/store";
import { isMobile, isValidEmail, normalizePhone } from "@/lib/format";

/**
 * فرم ارتباط که یک درخواست از نوع «سایر درخواست‌ها» ثبت می‌کند
 * تا پیام کاربر هم کد پیگیری داشته باشد و در پیشخوان دیده شود.
 */
export function ContactForm() {
  const { addRequest, toast } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "پرسش عمومی",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "نام و نام خانوادگی را کامل وارد کنید.";
    if (!isMobile(form.phone)) next.phone = "شماره همراه معتبر وارد کنید.";
    if (form.email && !isValidEmail(form.email)) next.email = "قالب ایمیل صحیح نیست.";
    if (form.message.trim().length < 15) next.message = "متن پیام را کامل‌تر بنویسید (حداقل ۱۵ نویسه).";
    if (!form.consent) next.consent = "برای ارسال، تأیید شرایط لازم است.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.warning("فرم کامل نیست", "موارد مشخص‌شده را اصلاح کنید.");
      return;
    }

    setLoading(true);
    const record = addRequest({
      serviceSlug: "other",
      fullName: form.name.trim(),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      requesterType: "person",
      organization: "",
      contactPreference: form.email ? "email" : "phone",
      city: "قزوین",
      summary: `${form.subject} — ${form.message.trim()}`,
      answers: [
        { key: "request_subject", label: "موضوع پیام", value: form.subject },
        { key: "message", label: "متن پیام", value: form.message.trim() },
      ],
      attachments: [],
      consent: form.consent,
      newsletter: false,
    });
    setLoading(false);
    if (record) router.push(`/request/success?code=${record.trackingCode}`);
  };

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="نام و نام خانوادگی"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="مثلاً: مریم رضایی"
            icon="user"
            error={errors.name}
          />
          <Input
            label="شماره همراه"
            required
            numeric
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            icon="phone"
            error={errors.phone}
            dir="ltr"
            className="text-start"
          />
          <Input
            label="ایمیل"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="برای دریافت پاسخ ایمیلی (اختیاری)"
            icon="mail"
            error={errors.email}
            dir="ltr"
            className="text-start"
          />
          <Select
            label="موضوع پیام"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            options={[
              { value: "پرسش عمومی", label: "پرسش عمومی" },
              { value: "کارت بهداشت", label: "کارت بهداشت" },
              { value: "آموزش بهداشت اصناف", label: "آموزش بهداشت اصناف" },
              { value: "صلاحیت بهداشت", label: "صلاحیت بهداشت" },
              { value: "ممیزی و قرارداد", label: "ممیزی و قرارداد" },
              { value: "پیگیری درخواست قبلی", label: "پیگیری درخواست قبلی" },
              { value: "انتقاد یا پیشنهاد", label: "انتقاد یا پیشنهاد" },
            ]}
          />
        </div>

        <Textarea
          label="متن پیام"
          required
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="موضوع را دقیق بنویسید: نام واحد صنفی، نوع فعالیت و پرسش خود."
          error={errors.message}
          help="هر چه توضیح دقیق‌تر باشد، پاسخ کارشناس سریع‌تر و دقیق‌تر خواهد بود."
        />

        <Checkbox
          checked={form.consent}
          onChange={(checked) => set("consent", checked)}
          label="ارسال این پیام به‌عنوان درخواست در سامانه را می‌پذیرم."
          description="پس از ارسال، کد پیگیری دریافت می‌کنید و پاسخ کارشناس در صفحه پیگیری نمایش داده می‌شود."
          error={errors.consent}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" icon="send" loading={loading}>
            ارسال پیام و دریافت کد پیگیری
          </Button>
          <span className="flex items-center gap-1.5 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
            <Icon name="lock" size={14} />
            اطلاعات شما فقط برای پاسخ به همین پیام استفاده می‌شود.
          </span>
        </div>

        <Alert tone="info" icon="sparkles">
          در این نسخه نمایشی، پیام شما در مرورگر خودتان ثبت می‌شود و در پیشخوان مدیریت (بخش «سایر درخواست‌ها») قابل
          مشاهده است.
        </Alert>
      </form>
    </Card>
  );
}
