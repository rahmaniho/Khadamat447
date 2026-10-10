"use client";

import { useState } from "react";

export function CopyButton({ text, label = "کپی کد پیگیری" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // مرورگرهای بدون دسترسی کلیپ‌بورد: متن در صفحه قابل انتخاب است
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-800 hover:bg-brand-50"
    >
      {copied ? "کپی شد ✓" : label}
    </button>
  );
}
