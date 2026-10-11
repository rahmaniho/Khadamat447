"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { isValidEmail } from "@/lib/format";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-[0.8rem] font-bold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
        <Icon name="checkCircle" size={20} />
        ثبت شد. از این پس اطلاع‌رسانی‌های مربوط به خدمات را دریافت می‌کنید.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState("idle");
          }}
          placeholder="نشانی ایمیل شما"
          aria-label="نشانی ایمیل برای اطلاع‌رسانی"
          error={state === "error" ? "نشانی ایمیل معتبر نیست." : undefined}
          className="bg-[var(--surface)]"
        />
      </div>
      <Button type="submit" icon="send" className="sm:mt-0">
        ثبت
      </Button>
    </form>
  );
}
