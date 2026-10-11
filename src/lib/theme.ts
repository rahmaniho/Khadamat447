/**
 * تنظیمات تم روشن/تاریک — منبع یکتای حقیقت
 * ---------------------------------------------------------------
 * کلید ذخیره‌سازی و اسکریپت «ضد پرش رنگ» هر دو اینجا تعریف می‌شوند تا
 * ارائه‌دهنده تم (سمت مرورگر) و چیدمان ریشه (سمت سرور) واگرا نشوند.
 */

export const THEME_STORAGE_KEY = "khadamat447.theme";

export type Theme = "light" | "dark";

/**
 * کد اسکریپت مسدودکننده
 * ---------------------------------------------------------------
 * این اسکریپت پیش از نخستین رنگ‌آمیزی صفحه (first paint) اجرا می‌شود و
 * کلاس `dark` را روی `<html>` می‌گذارد؛ بنابراین کاربری که حالت تاریک را
 * انتخاب کرده، هنگام بارگذاری صفحه «پرش سفید» نمی‌بیند. بدون آن، اعمال
 * تم در `useEffect` و بعد از رنگ‌آمیزی اول انجام می‌شد و همان پرش رخ می‌داد.
 *
 * در برابر خطا مقاوم است: اگر `localStorage` در دسترس نباشد (حالت
 * ناشناس یا مسدود)، بی‌صدا رد می‌شود و به تنظیم سیستم برمی‌گردد.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="dark"||s==="light")?s:(m?"dark":"light");var e=document.documentElement;e.classList.toggle("dark",t==="dark");e.style.colorScheme=t;}catch(e){}})();`;
