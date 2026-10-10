/** پیام‌های کوتاه پس از ذخیره‌سازی در پنل مدیریت (از طریق query string، بدون کوکی) */
export function flashPath(path: string, message: string, tone: "ok" | "err" = "ok"): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${tone === "ok" ? "msg" : "err"}=${encodeURIComponent(message.slice(0, 200))}`;
}
