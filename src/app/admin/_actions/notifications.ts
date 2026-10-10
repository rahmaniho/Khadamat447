"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { dispatchPending, retryNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { flashPath } from "@/lib/admin-flash";

export async function retryNotificationAction(formData: FormData): Promise<void> {
  const me = await requirePermission("notifications.retry");
  const id = String(formData.get("id") || "");
  const res = await retryNotification(id);
  await logAudit({ id: me.id, name: me.name, role: me.role }, "notification.retried", { type: "notification", id }, { status: res.status });
  redirect(flashPath("/admin/notifications", res.ok ? "اعلان ارسال شد." : `ارسال انجام نشد (وضعیت: ${res.status}).`, res.ok ? "ok" : "err"));
}

export async function dispatchPendingAction(): Promise<void> {
  const me = await requirePermission("notifications.retry");
  const stats = await dispatchPending(25);
  await logAudit({ id: me.id, name: me.name, role: me.role }, "notification.dispatched", { type: "notification" }, stats);
  redirect(flashPath("/admin/notifications", `پردازش شد: ${stats.processed} مورد، ارسال‌شده: ${stats.sent}، ناموفق: ${stats.failed}، پیکربندی‌نشده: ${stats.skipped}`));
}
