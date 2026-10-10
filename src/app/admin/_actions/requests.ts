"use server";

import fs from "node:fs";
import { redirect } from "next/navigation";
import { all, get, run, tx, nowIso } from "@/lib/db";
import { newId } from "@/lib/utils";
import { requirePermission } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { flashPath } from "@/lib/admin-flash";
import { statusUpdateSchema } from "@/lib/validation";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import { notifyStatusChange } from "@/lib/notifications";
import { deleteStoredFile, saveUpload, uploadLimitsFromSettings, requestStorageDir } from "@/lib/files";
import { getSettings } from "@/lib/settings";
import { cleanText } from "@/lib/validation";

function detailPath(id: string) {
  return `/admin/requests/${encodeURIComponent(id)}`;
}

export async function updateStatusAction(formData: FormData): Promise<void> {
  const user = await requirePermission("requests.manage");
  const parsed = statusUpdateSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    publicNote: formData.get("publicNote") || "",
    internalNote: formData.get("internalNote") || "",
    notifyApplicant: formData.get("notifyApplicant") === "on",
  });
  if (!parsed.success) redirect(flashPath(detailPath(String(formData.get("requestId") || "")), "اطلاعات وضعیت نامعتبر است.", "err"));
  const d = parsed.data;
  const current = await get<{ status: string; tracking_code: string; preferred_contact: string; email: string; public_note: string }>(
    "SELECT status, tracking_code, preferred_contact, email, public_note FROM requests WHERE id = ?",
    [d.requestId],
  );
  if (!current) redirect("/admin/requests");

  const note = cleanText(d.publicNote || "", 1500);
  if ((d.status === "needs_info" || d.status === "rejected") && !note) {
    redirect(flashPath(detailPath(d.requestId), "برای این وضعیت، ثبت توضیح قابل‌مشاهده برای متقاضی الزامی است.", "err"));
  }
  const changed = current.status !== d.status || note !== (current.public_note || "");
  if (!changed && !d.internalNote) redirect(flashPath(detailPath(d.requestId), "تغییری برای ذخیره وجود ندارد.", "err"));

  await tx(async (t) => {
    await t.run("UPDATE requests SET status = ?, public_note = ?, updated_at = ? WHERE id = ?", [d.status, note, nowIso(), d.requestId]);
    if (current.status !== d.status) {
      await t.run(
        "INSERT INTO request_status_history (id, request_id, from_status, to_status, note, actor_id, actor_name, created_at) VALUES (?,?,?,?,?,?,?,?)",
        [newId(), d.requestId, current.status, d.status, note, user.id, user.name, nowIso()],
      );
    }
    if (d.internalNote && cleanText(d.internalNote)) {
      await t.run("INSERT INTO request_notes (id, request_id, author_id, author_name, body, created_at) VALUES (?,?,?,?,?,?)", [
        newId(), d.requestId, user.id, user.name, cleanText(d.internalNote, 2000), nowIso(),
      ]);
    }
  });

  await logAudit(
    { id: user.id, name: user.name, role: user.role },
    "request.status_changed",
    { type: "request", id: d.requestId },
    { from: current.status, to: d.status, tracking_code: current.tracking_code },
  );

  // اعلان به متقاضی فقط در صورت انتخاب ایمیل به‌عنوان روش ارتباطی و تأیید مدیر
  if (current.status !== d.status && d.notifyApplicant && current.preferred_contact === "email" && current.email) {
    try {
      await notifyStatusChange({
        requestId: d.requestId,
        trackingCode: current.tracking_code,
        status: d.status as RequestStatus,
        publicNote: note,
        applicantEmail: current.email,
      });
    } catch {
      /* خطای اعلان نباید تغییر وضعیت را لغو کند؛ در صف اعلان‌ها ثبت می‌شود */
    }
  }
  redirect(flashPath(detailPath(d.requestId), `وضعیت به «${REQUEST_STATUSES[d.status as RequestStatus].label}» تغییر کرد.`));
}

export async function addInternalNoteAction(formData: FormData): Promise<void> {
  const user = await requirePermission("requests.manage");
  const requestId = String(formData.get("requestId") || "");
  const body = cleanText(formData.get("body") || "", 2000);
  if (!body) redirect(flashPath(detailPath(requestId), "متن یادداشت خالی است.", "err"));
  await run("INSERT INTO request_notes (id, request_id, author_id, author_name, body, created_at) VALUES (?,?,?,?,?,?)", [
    newId(), requestId, user.id, user.name, body, nowIso(),
  ]);
  await logAudit({ id: user.id, name: user.name, role: user.role }, "request.note_added", { type: "request", id: requestId });
  redirect(flashPath(detailPath(requestId), "یادداشت داخلی ثبت شد (برای متقاضی نمایش داده نمی‌شود)."));
}

export async function toggleArchiveAction(formData: FormData): Promise<void> {
  const user = await requirePermission("requests.manage");
  const requestId = String(formData.get("requestId") || "");
  const row = await get<{ archived: number }>("SELECT archived FROM requests WHERE id = ?", [requestId]);
  if (!row) redirect("/admin/requests");
  const next = row.archived ? 0 : 1;
  await run("UPDATE requests SET archived = ?, updated_at = ? WHERE id = ?", [next, nowIso(), requestId]);
  await logAudit({ id: user.id, name: user.name, role: user.role }, next ? "request.archived" : "request.unarchived", { type: "request", id: requestId });
  redirect(flashPath(detailPath(requestId), next ? "درخواست بایگانی شد." : "درخواست از بایگانی خارج شد."));
}

/** حذف دائمی درخواست و مدارک آن (فقط مدیر کل؛ پس از بایگانی و طبق سیاست نگهداری) */
export async function deleteRequestAction(formData: FormData): Promise<void> {
  const user = await requirePermission("requests.delete");
  const requestId = String(formData.get("requestId") || "");
  const row = await get<{ tracking_code: string }>("SELECT tracking_code FROM requests WHERE id = ?", [requestId]);
  if (!row) redirect("/admin/requests");
  const files = await all<{ stored_name: string }>("SELECT stored_name FROM attachments WHERE request_id = ?", [requestId]);
  await run("DELETE FROM notifications WHERE request_id = ?", [requestId]);
  await run("DELETE FROM requests WHERE id = ?", [requestId]);
  for (const f of files) {
    try {
      deleteStoredFile(requestId, f.stored_name);
    } catch {
      /* ignore */
    }
  }
  try {
    const dir = requestStorageDir(requestId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  await logAudit({ id: user.id, name: user.name, role: user.role }, "request.deleted", { type: "request", id: requestId }, { tracking_code: row.tracking_code });
  redirect(flashPath("/admin/requests", "درخواست و مدارک آن حذف شدند."));
}

export async function deleteAttachmentAction(formData: FormData): Promise<void> {
  const user = await requirePermission("attachments.manage");
  const attachmentId = String(formData.get("attachmentId") || "");
  const att = await get<{ id: string; request_id: string; stored_name: string; deleted_at: string | null }>(
    "SELECT id, request_id, stored_name, deleted_at FROM attachments WHERE id = ?",
    [attachmentId],
  );
  if (!att || att.deleted_at) redirect("/admin/requests");
  deleteStoredFile(att.request_id, att.stored_name);
  await run("UPDATE attachments SET deleted_at = ?, deleted_by = ? WHERE id = ?", [nowIso(), user.name, att.id]);
  await run("INSERT INTO attachment_access_logs (id, attachment_id, request_id, actor_id, actor_role, action, created_at) VALUES (?,?,?,?,?,?,?)", [
    newId(), att.id, att.request_id, user.id, user.role, "delete", nowIso(),
  ]);
  await logAudit({ id: user.id, name: user.name, role: user.role }, "attachment.deleted", { type: "attachment", id: att.id }, { request: att.request_id });
  redirect(flashPath(detailPath(att.request_id), "فایل حذف شد."));
}

/** جایگزینی مدرک: فایل جدید ذخیره و نسخه قبلی حذف (نرم) می‌شود */
export async function replaceAttachmentAction(formData: FormData): Promise<void> {
  const user = await requirePermission("attachments.manage");
  const attachmentId = String(formData.get("attachmentId") || "");
  const att = await get<{ id: string; request_id: string; stored_name: string; deleted_at: string | null }>(
    "SELECT id, request_id, stored_name, deleted_at FROM attachments WHERE id = ?",
    [attachmentId],
  );
  const file = formData.get("file");
  if (!att || att.deleted_at) redirect("/admin/requests");
  if (!(file instanceof File) || file.size === 0) redirect(flashPath(detailPath(att.request_id), "فایل جایگزین انتخاب نشده است.", "err"));

  const limits = uploadLimitsFromSettings(await getSettings());
  const saved = await saveUpload(file as File, att.request_id, limits);
  if (!saved.ok) redirect(flashPath(detailPath(att.request_id), saved.reason, "err"));

  await tx(async (t) => {
    await t.run("UPDATE attachments SET deleted_at = ?, deleted_by = ? WHERE id = ?", [nowIso(), user.name, att.id]);
    await t.run(
      `INSERT INTO attachments (id, request_id, original_name, stored_name, mime_type, size_bytes, sha256, note, uploaded_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [newId(), att.request_id, saved.file.originalName, saved.file.storedName, saved.file.mime, saved.file.sizeBytes, saved.file.sha256, `جایگزین شده توسط ${user.name}`, nowIso()],
    );
  });
  deleteStoredFile(att.request_id, att.stored_name);
  await logAudit({ id: user.id, name: user.name, role: user.role }, "attachment.replaced", { type: "attachment", id: att.id }, { request: att.request_id });
  redirect(flashPath(detailPath(att.request_id), "مدرک جایگزین شد."));
}
