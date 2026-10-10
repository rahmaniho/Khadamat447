/**
 * سامانه اعلان‌ها
 * ---------------------------------------------------------------
 * - صف اعلان‌ها در پایگاه داده ذخیره می‌شود؛ اگر سرویس ایمیل در دسترس نباشد،
 *   درخواست کاربر از بین نمی‌رود و اعلان با وضعیت ناموفق ثبت و بعداً دوباره تلاش می‌شود.
 * - کلید یکتای dedupe از ارسال اعلان تکراری جلوگیری می‌کند.
 * - اطلاعات حساس (مدارک، کد ملی، جزئیات پزشکی) هرگز در اعلان قرار نمی‌گیرد.
 */
import { all, get, run, nowIso } from "@/lib/db";
import { newId } from "@/lib/utils";
import { getSetting, envOnly } from "@/lib/settings";
import { logInfo, logWarn } from "@/lib/logger";
import { sendEmail, emailConfigured, emailProviderName } from "./providers/email";
import { sendTelegram, telegramConfigured } from "./providers/telegram";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";

export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";

export interface NotificationRow {
  id: string;
  request_id: string;
  kind: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  attempts: number;
  last_error: string;
  created_at: string;
  sent_at: string | null;
  next_attempt_at: string | null;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export async function queueNotification(input: {
  requestId?: string;
  kind: string;
  channel: "email" | "telegram";
  recipient: string;
  subject?: string;
  body: string;
  dedupeKey: string;
}): Promise<{ id: string; created: boolean }> {
  const existing = await get<{ id: string }>("SELECT id FROM notifications WHERE dedupe_key = ?", [input.dedupeKey]);
  if (existing) return { id: existing.id, created: false };
  const id = newId();
  await run(
    `INSERT INTO notifications (id, request_id, kind, channel, recipient, subject, body, status, attempts, dedupe_key, created_at)
     VALUES (?,?,?,?,?,?,?,?,0,?,?)`,
    [id, input.requestId || "", input.kind, input.channel, input.recipient, input.subject || "", input.body, "pending", input.dedupeKey, nowIso()],
  );
  return { id, created: true };
}

const MAX_ATTEMPTS = 5;

async function deliver(row: NotificationRow): Promise<void> {
  const attempt = Number(row.attempts) + 1;
  let result: { ok: boolean; skipped?: boolean; error?: string };

  if (row.channel === "telegram") result = await sendTelegram(row.body);
  else result = await sendEmail({ to: row.recipient, subject: row.subject || "اعلان سامانه", text: row.body });

  if (result.ok) {
    await run("UPDATE notifications SET status = 'sent', attempts = ?, last_error = '', sent_at = ? WHERE id = ?", [
      attempt, nowIso(), row.id,
    ]);
    return;
  }
  if (result.skipped) {
    await run("UPDATE notifications SET status = 'skipped', attempts = ?, last_error = ? WHERE id = ?", [
      attempt, result.error || "", row.id,
    ]);
    return;
  }
  const backoffMs = Math.min(15 * 60 * 1000, 60 * 1000 * 2 ** (attempt - 1));
  const nextAt = attempt >= MAX_ATTEMPTS ? null : new Date(Date.now() + backoffMs).toISOString();
  await run("UPDATE notifications SET status = 'failed', attempts = ?, last_error = ?, next_attempt_at = ? WHERE id = ?", [
    attempt, result.error || "", nextAt, row.id,
  ]);
}

export async function dispatchPending(limit = 10): Promise<{ processed: number; sent: number; failed: number; skipped: number }> {
  const rows = await all<NotificationRow>(
    `SELECT * FROM notifications
      WHERE (status = 'pending' OR (status = 'failed' AND next_attempt_at IS NOT NULL))
        AND attempts < ?
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC LIMIT ?`,
    [MAX_ATTEMPTS, nowIso(), limit],
  );
  const stats = { processed: rows.length, sent: 0, failed: 0, skipped: 0 };
  for (const row of rows) {
    await deliver(row);
    const updated = await get<{ status: string }>("SELECT status FROM notifications WHERE id = ?", [row.id]);
    if (updated?.status === "sent") stats.sent++;
    else if (updated?.status === "skipped") stats.skipped++;
    else stats.failed++;
  }
  return stats;
}

export async function retryNotification(id: string): Promise<{ ok: boolean; status: string }> {
  const row = await get<NotificationRow>("SELECT * FROM notifications WHERE id = ?", [id]);
  if (!row) return { ok: false, status: "not_found" };
  await run("UPDATE notifications SET next_attempt_at = NULL WHERE id = ?", [id]);
  await deliver(row);
  const updated = await get<{ status: string }>("SELECT status FROM notifications WHERE id = ?", [id]);
  return { ok: updated?.status === "sent", status: updated?.status || "unknown" };
}

export interface NewRequestNotifyInput {
  id: string;
  trackingCode: string;
  serviceTitle: string;
  createdAt: string;
  applicantEmail: string;
  preferredContact: string;
}

export async function notifyNewRequest(req: NewRequestNotifyInput): Promise<void> {
  const siteName = await getSetting("site.name");
  const siteUrl = envOnly.siteUrl();
  const vars = {
    tracking_code: req.trackingCode,
    service: req.serviceTitle,
    created_at: req.createdAt,
    site_name: siteName,
    site_url: siteUrl,
  };

  const adminEmail = envOnly.adminEmail();
  if (adminEmail) {
    await queueNotification({
      requestId: req.id,
      kind: "admin_new_request",
      channel: "email",
      recipient: adminEmail,
      subject: await getSetting("notify.admin_email_subject"),
      body: renderTemplate(await getSetting("notify.admin_email_body"), vars),
      dedupeKey: `admin_new_request:${req.id}`,
    });
  }

  if (telegramConfigured()) {
    await queueNotification({
      requestId: req.id,
      kind: "admin_new_request",
      channel: "telegram",
      recipient: "telegram-chat",
      body: renderTemplate(await getSetting("notify.telegram_template"), vars),
      dedupeKey: `admin_new_request_tg:${req.id}`,
    });
  }

  if (req.preferredContact === "email" && req.applicantEmail) {
    await queueNotification({
      requestId: req.id,
      kind: "applicant_confirmation",
      channel: "email",
      recipient: req.applicantEmail,
      subject: await getSetting("notify.applicant_email_subject"),
      body: renderTemplate(await getSetting("notify.applicant_email_body"), vars),
      dedupeKey: `applicant_confirmation:${req.id}`,
    });
  }

  await dispatchPending(10);
  await refreshRequestNotificationState(req.id);
}

export async function notifyStatusChange(input: {
  requestId: string;
  trackingCode: string;
  status: RequestStatus;
  publicNote: string;
  applicantEmail: string;
}): Promise<void> {
  if (!input.applicantEmail) return;
  const vars = {
    tracking_code: input.trackingCode,
    status: REQUEST_STATUSES[input.status]?.label ?? input.status,
    public_note: input.publicNote || "توضیحی ثبت نشده است.",
    site_name: await getSetting("site.name"),
    site_url: envOnly.siteUrl(),
  };
  const queued = await queueNotification({
    requestId: input.requestId,
    kind: "status_change",
    channel: "email",
    recipient: input.applicantEmail,
    subject: await getSetting("notify.status_change_subject"),
    body: renderTemplate(await getSetting("notify.status_change_body"), vars),
    dedupeKey: `status_change:${input.requestId}:${input.status}`,
  });
  if (!queued.created) return;
  await dispatchPending(5);
  await refreshRequestNotificationState(input.requestId);
}

async function refreshRequestNotificationState(requestId: string): Promise<void> {
  const rows = await all<{ status: string }>("SELECT status FROM notifications WHERE request_id = ?", [requestId]);
  if (rows.length === 0) {
    await run("UPDATE requests SET notification_state = 'skipped', updated_at = ? WHERE id = ?", [nowIso(), requestId]);
    return;
  }
  const statuses = rows.map((r) => r.status);
  let state: string;
  if (statuses.every((s) => s === "sent")) state = "sent";
  else if (statuses.every((s) => s === "skipped")) state = "skipped";
  else if (statuses.some((s) => s === "failed")) state = "failed";
  else if (statuses.some((s) => s === "sent")) state = "partial";
  else state = "pending";
  await run("UPDATE requests SET notification_state = ?, updated_at = ? WHERE id = ?", [state, nowIso(), requestId]);
}

export async function notificationHealth(): Promise<{
  emailConfigured: boolean;
  emailProvider: string;
  telegramConfigured: boolean;
  adminEmailSet: boolean;
  pending: number;
  failed: number;
  skipped: number;
}> {
  const counts = await get<{ pending: number; failed: number; skipped: number }>(
    `SELECT
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
       SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) AS skipped
     FROM notifications`,
  );
  return {
    emailConfigured: emailConfigured(),
    emailProvider: emailProviderName(),
    telegramConfigured: telegramConfigured(),
    adminEmailSet: Boolean(envOnly.adminEmail()),
    pending: Number(counts?.pending || 0),
    failed: Number(counts?.failed || 0),
    skipped: Number(counts?.skipped || 0),
  };
}

export async function recentNotifications(limit = 30): Promise<NotificationRow[]> {
  return all<NotificationRow>("SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?", [limit]);
}

export function notificationReadinessWarning(): string | null {
  const parts: string[] = [];
  if (!envOnly.adminEmail()) parts.push("ADMIN_NOTIFICATION_EMAIL");
  if (!emailConfigured()) parts.push("SMTP_* یا RESEND_API_KEY به‌همراه MAIL_FROM");
  if (parts.length === 0) {
    logInfo("اعلان‌ها آماده ارسال هستند", { provider: emailProviderName() });
    return null;
  }
  logWarn("اعلان ایمیلی پیکربندی نشده است", { missing: parts.join("، ") });
  return `اعلان ایمیلی فعال نیست (کمبود: ${parts.join("، ")}). درخواست‌ها در پایگاه داده ذخیره می‌شوند اما ایمیل اطلاع‌رسانی ارسال نمی‌شود.`;
}
