import Image from "next/image";

/**
 * نشان گرافیکی دفتر (سپر سبز با صلیب و جوانه).
 * تصویر تزئینی است؛ نام دفتر همیشه کنار آن به‌صورت متن نوشته می‌شود.
 */
export function BrandMark({ size = 44, priority = false, className = "" }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={`h-auto w-auto shrink-0 ${className}`}
    />
  );
}
