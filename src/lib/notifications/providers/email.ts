/**
 * ارائه‌دهنده ارسال ایمیل
 * ---------------------------------------------------------------
 * دو مسیر پشتیبانی می‌شود و با تغییر متغیرهای محیطی انتخاب می‌شود:
 *   ۱) SMTP (سازمانی یا سرویس‌های دارای SMTP)
 *   ۲) Resend (با RESEND_API_KEY)
 * اگر هیچ‌کدام پیکربندی نشده باشد، ارسال انجام نمی‌شود و وضعیت «skipped» ثبت می‌شود.
 */
import { logInfo, logError } from "@/lib/logger";

/** نشانی ایمیل در لاگ‌ها به‌صورت ناقص ثبت می‌شود */
const mask = (e: string) => (e.includes("@") ? `${e.slice(0, 2)}***@${e.split("@")[1]}` : "***");

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  provider?: string;
  error?: string;
}

export function emailConfigured(): boolean {
  const smtp = Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
  const resend = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
  return smtp || resend;
}

export function emailProviderName(): string {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) return "resend";
  if (process.env.SMTP_HOST && process.env.MAIL_FROM) return "smtp";
  return "none";
}

async function sendViaSmtp(msg: EmailMessage): Promise<SendResult> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    tls: { rejectUnauthorized: process.env.SMTP_TLS_INSECURE === "true" ? false : true },
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    replyTo: msg.replyTo,
  });
  return { ok: true, provider: "smtp" };
}

async function sendViaResend(msg: EmailMessage): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
      reply_to: msg.replyTo,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, provider: "resend", error: `Resend ${res.status}: ${body.slice(0, 300)}` };
  }
  return { ok: true, provider: "resend" };
}

export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const provider = emailProviderName();
  if (provider === "none") {
    return { ok: false, skipped: true, error: "سرویس ایمیل پیکربندی نشده است (SMTP_* یا RESEND_API_KEY)." };
  }
  try {
    const result = provider === "resend" ? await sendViaResend(msg) : await sendViaSmtp(msg);
    if (result.ok) logInfo("ایمیل ارسال شد", { to: mask(msg.to), provider });
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("خطا در ارسال ایمیل", { to: mask(msg.to), provider, error: message });
    return { ok: false, provider, error: message.slice(0, 500) };
  }
}
