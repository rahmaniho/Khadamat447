/**
 * کدهای نمونه برای بررسی سریع نسخه نمایشی
 * ---------------------------------------------------------------
 * این فهرست فقط در نسخه نمایشی استفاده می‌شود تا بازدیدکننده بدون ثبت
 * درخواست جدید، صفحه پیگیری و پیشخوان را با داده واقع‌نما ببیند.
 * کدها با داده اولیه (seed) هم‌خوان هستند.
 */

export interface DemoHint {
  code: string;
  phone: string;
  label: string;
  status: string;
}

export const DEMO_HINTS: DemoHint[] = [
  { code: "K447-7473P-8EVDW", phone: "09125556677", label: "کارت بهداشت — در حال بررسی", status: "in_review" },
  { code: "K447-4357M-9FVDW", phone: "09195556677", label: "صلاحیت بهداشت — آماده نتیجه", status: "ready_to_report" },
  { code: "K447-NP9LL-RGVDW", phone: "09369998877", label: "پرسش — تکمیل‌شده", status: "completed" },
];

export const DEMO_HINT_PRIMARY = DEMO_HINTS[0];
