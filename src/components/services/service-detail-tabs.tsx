"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Tabs } from "@/components/ui/overlay";
import { CheckList } from "@/components/site/section";
import { Markdown } from "@/components/site/markdown";
import type { ServiceView } from "@/lib/content";

export function ServiceDetailTabs({ service }: { service: ServiceView }) {
  const [active, setActive] = useState("intro");

  return (
    <div className="space-y-6">
      <Tabs
        active={active}
        onChange={setActive}
        tabs={[
          { id: "intro", label: "معرفی خدمت", icon: "info" },
          { id: "audience", label: "مخاطبان", icon: "users" },
          { id: "process", label: "مراحل انجام", icon: "wizard" },
          { id: "documents", label: "مدارک لازم", icon: "clipboard" },
          { id: "fields", label: "اطلاعات فرم", icon: "edit" },
        ]}
      />

      <div className="surface-card p-6 md:p-8">
        {active === "intro" && (
          <div className="animate-fade-up space-y-6">
            <Markdown source={service.intro} />
            <div className="grid gap-4 sm:grid-cols-3">
              {service.deliverables.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-4">
                  <Icon name="checkCircle" size={18} className="text-brand-600 dark:text-brand-400" />
                  <p className="mt-2 text-[0.8rem] font-bold leading-6 text-ink-700 dark:text-ink-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "audience" && (
          <div className="animate-fade-up">
            <h3 className="text-lg font-black text-ink-900 dark:text-white">این خدمت برای چه کسانی است؟</h3>
            <p className="mt-2 text-[0.84rem] leading-7 text-ink-600 dark:text-ink-300">
              اگر در یکی از گروه‌های زیر قرار می‌گیرید، می‌توانید درخواست خود را از همین سامانه ثبت کنید.
            </p>
            <div className="mt-5">
              <Markdown source={service.audience} />
            </div>
          </div>
        )}

        {active === "process" && (
          <div className="animate-fade-up">
            <h3 className="text-lg font-black text-ink-900 dark:text-white">مراحل ثبت و بررسی</h3>
            <div className="mt-5">
              <Markdown source={service.process} />
            </div>
          </div>
        )}

        {active === "documents" && (
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-black text-ink-900 dark:text-white">فهرست مدارک راهنما</h3>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[0.66rem] font-black text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/25">
                راهنما — تأیید نهایی توسط کارشناس دفتر
              </span>
            </div>
            <div className="mt-5">
              <Markdown source={service.documents} />
            </div>
            <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-4">
              <p className="text-[0.8rem] font-black text-ink-800 dark:text-ink-100">نکات بارگذاری فایل</p>
              <div className="mt-3">
                <CheckList
                  items={[
                    "قالب‌های مجاز: PDF، JPG، PNG و WEBP",
                    "حداکثر حجم هر فایل: ۵ مگابایت",
                    `حداکثر تعداد فایل برای این خدمت: ${service.maxAttachments}`,
                    "امکان ارسال درخواست بدون فایل نیز وجود دارد",
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {active === "fields" && (
          <div className="animate-fade-up">
            <h3 className="text-lg font-black text-ink-900 dark:text-white">
              اطلاعاتی که در فرم این خدمت پرسیده می‌شود
            </h3>
            <p className="mt-2 text-[0.84rem] leading-7 text-ink-600 dark:text-ink-300">
              فرم هر خدمت اختصاصی است؛ در مجموع {service.fields.length} فیلد برای این خدمت تعریف شده است.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {service.fields.map((field) => (
                <li
                  key={field.id}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] p-3.5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon
                      name={
                        field.type === "select"
                          ? "layers"
                          : field.type === "textarea"
                            ? "edit"
                            : field.type === "number"
                              ? "chart"
                              : "edit"
                      }
                      size={16}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.82rem] font-black text-ink-900 dark:text-white">{field.label}</span>
                      {field.required && (
                        <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[0.6rem] font-black text-rose-700 dark:bg-rose-500/12 dark:text-rose-300">
                          الزامی
                        </span>
                      )}
                    </span>
                    {field.help && <span className="mt-1 block text-[0.72rem] leading-6 text-ink-500 dark:text-ink-400">{field.help}</span>}
                    {field.options && (
                      <span className="mt-1.5 block text-[0.68rem] text-ink-500 dark:text-ink-400">
                        گزینه‌ها: {field.options.join(" · ")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
