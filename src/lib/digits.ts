/** تبدیل سریع ارقام لاتین به فارسی (برای متن‌های ثابت) */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
