import { checkPermission } from "@/lib/auth/guard";
import { all } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { clientIp, ipHash } from "@/lib/requests";
import { formatFaDate } from "@/lib/utils";
import { REQUEST_STATUSES } from "@/lib/constants";

/**
 * خروجی CSV با حداقل اطلاعات (کد پیگیری، خدمت، وضعیت، زمان ثبت، شهر و نوع متقاضی).
 * نام، شماره تماس، ایمیل و توضیحات عمداً در خروجی نیستند.
 */
export async function GET(request: Request) {
  const user = await checkPermission("requests.export");
  if (!user) return new Response("دسترسی مجاز نیست", { status: 403, headers: { "Cache-Control": "no-store" } });
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const params: string[] = [];
  let where = "WHERE archived = 0";
  if (status && status in REQUEST_STATUSES) {
    where += " AND status = ?";
    params.push(status);
  }
  const rows = await all<Record<string, unknown>>(
    `SELECT tracking_code, service_title, status, created_at, city, requester_type FROM requests ${where} ORDER BY created_at DESC LIMIT 5000`,
    params,
  );
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["کد پیگیری", "خدمت", "وضعیت", "زمان ثبت", "شهر", "نوع متقاضی"];
  const lines = [header.map(esc).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.tracking_code,
        r.service_title,
        REQUEST_STATUSES[String(r.status) as keyof typeof REQUEST_STATUSES]?.label ?? r.status,
        formatFaDate(String(r.created_at)),
        r.city,
        r.requester_type === "company" ? "حقوقی" : "حقیقی",
      ]
        .map(esc)
        .join(","),
    );
  }
  await logAudit(
    { id: user.id, name: user.name, role: user.role },
    "requests.exported",
    { type: "request" },
    { rows: rows.length, status: status || "all" },
    ipHash(await clientIp()),
  );
  const body = "\uFEFF" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="requests-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
