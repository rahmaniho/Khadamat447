"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Skeleton } from "@/components/ui/primitives";

/**
 * تولید کد QR واقعی در مرورگر (بدون سرویس بیرونی)
 * کتابخانه qrcode به‌صورت پویا بارگذاری می‌شود تا حجم اولیه صفحه کم بماند.
 */
export function QrCode({ value, size = 168, label }: { value: string; size?: number; label?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QR = await import("qrcode");
        const url = await QR.toDataURL(value, {
          width: size * 2,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#072624ff", light: "#ffffffff" },
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-soft)] p-5 text-center">
        <Icon name="qr" size={26} className="text-ink-400" />
        <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">نمایش کد QR در این مرورگر ممکن نشد.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          width={size}
          height={size}
          alt={label ?? "کد QR برای دسترسی سریع به این نشانی"}
          className="rounded-2xl border border-[var(--border-soft)] bg-white p-2 shadow-soft"
        />
      ) : (
        <Skeleton className="rounded-2xl" />
      )}
      {dataUrl && (
        <p className="text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
          {label ?? "با اسکن، همین درخواست در گوشی باز می‌شود"}
        </p>
      )}
    </div>
  );
}
