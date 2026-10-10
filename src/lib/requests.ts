/**
 * ثبت درخواست کامل: اعتبارسنجی، ذخیره فایل‌ها، تراکنش پایگاه داده، کد پیگیری و اعلان
 * - ارسال تکراری (دوبار کلیک) با client_submission_id شناسایی و به همان درخواست قبلی پاسخ داده می‌شود
 * - اگر ذخیره‌سازی با خطا مواجه شود، پیام موفقیت نمایش داده نمی‌شود
 */
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { all, get, tx, nowIso } from "@/lib/db";
import { newId, phoneLast4, hashValue, normalizePhone } from "@/lib/utils";
import { validateApplicant, validateServiceFields, cleanText, type ServiceFieldDef } from "@/lib/validation";
import { generateUniqueTrackingCode } from "@/lib/tracking";
import { saveUpload, uploadLimitsFromSettings, deleteStoredFile, requestStorageDir } from "@/lib/files";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/ratelimit";
import { logError, logSecurity, logInfo } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import { notifyNewRequest } from "@/lib/notifications";
import { REQUEST_STATUSES } from "@/lib/constants";
import fs from "node:fs";

export type SubmitResult =
  | { ok: true; trackingCode: string; duplicate: boolean }
  | { ok: false; message: string; errors?: Record<string, string> };

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || "unknown";
}

export async function clientUserAgent(): Promise<string> {
  const h = await headers();
  return (h.get("user-agent") || "").slice(0, 300);
}

export function ipHash(ip: string): string {
  const salt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || "khadamat447-ip-salt";
  return hashValue(ip, salt);
}

export async function submitRequest(formData: FormData): Promise<SubmitResult> {
  const ip = await clientIp();
  const ua = await clientUserAgent();

  // محدودیت نرخ: حداکثر ۱۰ ثبت در ۱۰ دقیقه برای هر IP
  const rl = rateLimit(`submit:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, message: `تعداد درخواست‌های ارسالی زیاد است. لطفاً ${rl.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید.` };
  }

  // تله هرزنامه (فیلد پنهان): اگر پر شده باشد، ربات است
  if (String(formData.get("website") || "").trim() !== "") {
    logSecurity("ارسال مشکوک به فیلد تله هرزنامه", { ip: ipHash(ip) });
    return { ok: false, message: "ارسال انجام نشد. لطفاً صفحه را بازخوانی کنید." };
  }

  const raw: Record<string, unknown> = {
    clientSubmissionId: formData.get("clientSubmissionId"),
    serviceSlug: formData.get("serviceSlug"),
    requesterType: formData.get("requesterType"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    city: formData.get("city") || "",
    orgName: formData.get("orgName") || "",
    preferredContact: formData.get("preferredContact"),
    message: formData.get("message") || "",
    consentAccuracy: formData.get("consentAccuracy") === "on",
    consentPrivacy: formData.get("consentPrivacy") === "on",
    consentMarketing: formData.get("consentMarketing") === "on",
  };

  // ارسال تکراری: اگر همین شناسه قبلاً ثبت شده، همان کد پیگیری برگردانده می‌شود
  const clientId = String(raw.clientSubmissionId || "");
  if (clientId.length >= 8) {
    const dup = await get<{ tracking_code: string }>("SELECT tracking_code FROM requests WHERE client_submission_id = ?", [clientId]);
    if (dup) return { ok: true, trackingCode: dup.tracking_code, duplicate: true };
  }

  const applicant = validateApplicant(raw);
  if (!applicant.ok) return { ok: false, message: "لطفاً خطاهای فرم را برطرف کنید.", errors: applicant.errors };

  const service = await get<{
    id: string; slug: string; title: string; allow_attachments: number; max_attachments: number; active: number;
  }>("SELECT id, slug, title, allow_attachments, max_attachments, active FROM services WHERE slug = ?", [applicant.data.serviceSlug]);
  if (!service || !service.active) return { ok: false, message: "خدمت انتخاب‌شده معتبر نیست.", errors: { serviceSlug: "خدمت موردنظر را انتخاب کنید." } };

  const defs = await all<ServiceFieldDef & { active: number }>(
    "SELECT id, field_key, label, type, options_json, required, active FROM service_fields WHERE service_id = ? AND active = 1 ORDER BY sort_order ASC",
    [service.id],
  );
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(applicant.data.fields || {})) extra[k] = String(v);
  for (const d of defs) {
    if (!(d.field_key in extra)) extra[d.field_key] = String(formData.get(`field_${d.field_key}`) ?? "");
  }
  const fieldsResult = validateServiceFields(defs, extra);
  if (!fieldsResult.ok) return { ok: false, message: "لطفاً فیلدهای الزامی خدمت را تکمیل کنید.", errors: fieldsResult.errors };

  // فایل‌ها
  const settings = await getSettings();
  const limits = uploadLimitsFromSettings(settings);
  const maxFiles = Math.min(service.max_attachments || limits.maxFiles, limits.maxFiles);
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 0 && !service.allow_attachments) {
    return { ok: false, message: "این خدمت بارگذاری فایل ندارد.", errors: { files: "این خدمت نیازی به بارگذاری فایل ندارد." } };
  }
  if (files.length > maxFiles) {
    return { ok: false, message: `حداکثر ${maxFiles} فایل مجاز است.`, errors: { files: `حداکثر ${maxFiles} فایل مجاز است.` } };
  }

  const requestId = newId();
  const savedPaths: string[] = [];
  const savedFiles: Array<{ storedName: string; originalName: string; mime: string; sizeBytes: number; sha256: string }> = [];
  try {
    for (const f of files) {
      const res = await saveUpload(f, requestId, limits);
      if (!res.ok) {
        cleanupFiles(requestId, savedPaths);
        return { ok: false, message: "بارگذاری یکی از فایل‌ها ناموفق بود.", errors: { files: res.reason } };
      }
      savedPaths.push(res.file.storedName);
      savedFiles.push({
        storedName: res.file.storedName,
        originalName: res.file.originalName,
        mime: res.file.mime,
        sizeBytes: res.file.sizeBytes,
        sha256: res.file.sha256,
      });
    }
  } catch (e) {
    logError("خطا در ذخیره فایل مدارک", { error: e instanceof Error ? e.message : String(e) });
    cleanupFiles(requestId, savedPaths);
    return { ok: false, message: "ذخیره فایل با خطا مواجه شد. درخواست ثبت نشد؛ لطفاً دوباره تلاش کنید." };
  }

  const trackingCode = await generateUniqueTrackingCode();
  const created = nowIso();
  const d = applicant.data;
  try {
    await tx(async (t) => {
      await t.run(
        `INSERT INTO requests (id, tracking_code, client_submission_id, service_id, service_slug, service_title,
           requester_type, full_name, phone, phone_last4, email, city, org_name, preferred_contact, message,
           status, consent_privacy_at, consent_marketing, source, ip_hash, user_agent, notification_state,
           created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          requestId, trackingCode, clientId || null, service.id, service.slug, service.title,
          d.requesterType, d.fullName, d.phoneNormalized, phoneLast4(d.phoneNormalized), (d.email || "").trim(),
          d.city || "", d.orgName || "", d.preferredContact, cleanText(d.message || "", 2000),
          "new", created, d.consentMarketing ? 1 : 0, "website", ipHash(ip), ua, "pending", created, created,
        ],
      );
      for (const f of fieldsResult.fields) {
        await t.run(
          "INSERT INTO request_fields (id, request_id, field_key, label, value, sort_order) VALUES (?,?,?,?,?,?)",
          [newId(), requestId, f.key, f.label, f.value, f.sortOrder],
        );
      }
      for (const f of savedFiles) {
        await t.run(
          `INSERT INTO attachments (id, request_id, original_name, stored_name, mime_type, size_bytes, sha256, uploaded_at)
           VALUES (?,?,?,?,?,?,?,?)`,
          [newId(), requestId, f.originalName, f.storedName, f.mime, f.sizeBytes, f.sha256, created],
        );
      }
      await t.run(
        `INSERT INTO request_status_history (id, request_id, from_status, to_status, note, actor_id, actor_name, created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
        [newId(), requestId, "", "new", "درخواست از طریق وب‌سایت ثبت شد.", "", "سامانه", created],
      );
    });
  } catch (e) {
    logError("خطا در ذخیره درخواست", { error: e instanceof Error ? e.message : String(e) });
    cleanupFiles(requestId, savedPaths);
    return { ok: false, message: "ذخیره درخواست با خطا مواجه شد. پیام موفقیت نمایش داده نمی‌شود؛ لطفاً دوباره تلاش کنید." };
  }

  logInfo("درخواست جدید ثبت شد", { tracking: trackingCode, service: service.slug, files: savedFiles.length });
  await logAudit({ name: "سامانه" }, "request.created", { type: "request", id: requestId }, { tracking_code: trackingCode, service: service.slug }, ipHash(ip));

  // اعلان‌ها: خطای اعلان نباید ثبت درخواست را لغو کند
  try {
    await notifyNewRequest({
      id: requestId,
      trackingCode,
      serviceTitle: service.title,
      createdAt: created,
      applicantEmail: (d.email || "").trim(),
      preferredContact: d.preferredContact,
    });
  } catch (e) {
    logError("خطا در صف‌بندی اعلان", { error: e instanceof Error ? e.message : String(e) });
  }

  return { ok: true, trackingCode, duplicate: false };
}

function cleanupFiles(requestId: string, storedNames: string[]) {
  for (const n of storedNames) {
    try {
      deleteStoredFile(requestId, n);
    } catch {
      /* ignore */
    }
  }
  try {
    const dir = requestStorageDir(requestId);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  } catch {
    /* ignore */
  }
}

export { REQUEST_STATUSES, normalizePhone, createHash };
