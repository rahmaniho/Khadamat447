import { get, all } from "@/lib/db";
import { asBool, asJson, nowIso } from "@/lib/db";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import { newTrackingCode, phoneLast4 } from "@/lib/utils";

export interface PublicRequestView {
  trackingCode: string;
  serviceTitle: string;
  status: RequestStatus;
  statusLabel: string;
  statusDescription: string;
  publicNote: string;
  createdAt: string;
  updatedAt: string;
  attachmentCount: number;
  history: Array<{ status: string; statusLabel: string; note: string; createdAt: string }>;
}

/** کد پیگیری یکتا تولید می‌کند و از تکراری نبودن آن مطمئن می‌شود */
export async function generateUniqueTrackingCode(): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const code = newTrackingCode();
    const found = await get("SELECT id FROM requests WHERE tracking_code = ?", [code]);
    if (!found) return code;
  }
  throw new Error("عدم امکان تولید کد پیگیری یکتا");
}

/**
 * دریافت نمای عمومی یک درخواست
 * برای جلوگیری از افشای اطلاعات، تنها با کد پیگیری + چهار رقم آخر شماره تماس قابل دسترسی است.
 */
export async function findRequestForTracking(
  trackingCode: string,
  verification: string,
): Promise<PublicRequestView | null> {
  const code = (trackingCode || "").trim().toUpperCase().replace(/\s+/g, "");
  const v = (verification || "").trim().replace(/\D/g, "");
  if (!code || v.length < 4) return null;

  const row = await get<{
    id: string; tracking_code: string; service_title: string; status: string; public_note: string;
    phone_last4: string; created_at: string; updated_at: string; archived: number;
  }>("SELECT * FROM requests WHERE tracking_code = ?", [code]);
  if (!row) return null;
  if (row.archived) return null;
  if ((row.phone_last4 || "").slice(-4) !== v.slice(-4)) return null;

  const history = await all<{ to_status: string; note: string; created_at: string }>(
    "SELECT to_status, note, created_at FROM request_status_history WHERE request_id = ? ORDER BY created_at ASC",
    [row.id],
  );
  const attachments = await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM attachments WHERE request_id = ? AND deleted_at IS NULL",
    [row.id],
  );

  const status = row.status as RequestStatus;
  return {
    trackingCode: row.tracking_code,
    serviceTitle: row.service_title,
    status,
    statusLabel: REQUEST_STATUSES[status]?.label ?? status,
    statusDescription: REQUEST_STATUSES[status]?.description ?? "",
    publicNote: row.public_note || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachmentCount: Number(attachments?.c || 0),
    history: history.map((h) => ({
      status: h.to_status,
      statusLabel: REQUEST_STATUSES[h.to_status as RequestStatus]?.label ?? h.to_status,
      note: h.note || "",
      createdAt: h.created_at,
    })),
  };
}

export { asBool, asJson, nowIso, phoneLast4 };
