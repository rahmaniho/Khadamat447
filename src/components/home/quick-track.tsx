"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * جست‌وجوی سریع درخواست از نوار کنار هدر اصلی
 * کاربر می‌تواند کد پیگیری را همین‌جا وارد کند و به صفحه پیگیری برود.
 */
export function QuickTrack({ className }: { className?: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase().replace(/\s/g, "");
    if (!value) {
      setError("کد پیگیری را وارد کنید.");
      return;
    }
    if (!/^(K447-)?[A-Z0-9]{5}-?[A-Z0-9]{5}$/.test(value)) {
      setError("قالب کد پیگیری صحیح نیست. نمونه: K447-ABCDE-FGHIJ");
      return;
    }
    setError(null);
    router.push(`/track?code=${encodeURIComponent(value)}`);
  };

  return (
    <div className={cn("rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)]/90 p-4 shadow-soft backdrop-blur", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon name="track" size={18} />
        </span>
        <div>
          <p className="text-[0.82rem] font-black text-ink-900 dark:text-white">پیگیری سریع درخواست</p>
          <p className="text-[0.68rem] text-ink-500 dark:text-ink-400">کد پیگیری خود را وارد کنید</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="K447-ABCDE-FGHIJ"
          dir="ltr"
          className="text-start tracking-wider"
          aria-label="کد پیگیری"
          error={error ?? undefined}
        />
        <Button type="submit" icon="arrowLeft" size="sm" full>
          نمایش وضعیت درخواست
        </Button>
      </form>

      <p className="mt-3 text-[0.68rem] leading-6 text-ink-500 dark:text-ink-400">
        کد را گم کرده‌اید؟{" "}
        <Link href="/my-requests" className="font-bold text-brand-700 hover:underline dark:text-brand-300">
          کارتابل من
        </Link>{" "}
        را ببینید یا با دفتر تماس بگیرید.
      </p>
    </div>
  );
}
