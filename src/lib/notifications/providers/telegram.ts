/** اعلان جایگزین: ربات تلگرام (بدون ارسال اطلاعات حساس) */
import { logInfo, logError } from "@/lib/logger";

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendTelegram(text: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chats = (process.env.TELEGRAM_CHAT_ID || "").split(",").map((c) => c.trim()).filter(Boolean);
  if (!token || chats.length === 0) {
    return { ok: false, skipped: true, error: "ربات تلگرام پیکربندی نشده است (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)." };
  }
  try {
    let lastError = "";
    for (const chat of chats) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      });
      if (!res.ok) lastError = `Telegram ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`;
    }
    if (lastError) return { ok: false, error: lastError };
    logInfo("پیام تلگرام ارسال شد", { chats: chats.length });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("خطا در ارسال پیام تلگرام", { error: message });
    return { ok: false, error: message.slice(0, 300) };
  }
}
