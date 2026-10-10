import { checkPermission } from "@/lib/auth/guard";
import { getAttachment } from "@/lib/queries";
import { readStoredFile } from "@/lib/files";
import { run, nowIso } from "@/lib/db";
import { newId } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { clientIp, ipHash } from "@/lib/requests";

/** دانلود مدرک خصوصی: فقط برای کاربران مجاز، با ثبت دسترسی و بدون کش */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await checkPermission("attachments.view");
  if (!user) return new Response("دسترسی مجاز نیست", { status: 403, headers: { "Cache-Control": "no-store" } });

  const att = await getAttachment(id);
  if (!att || att.deleted_at) return new Response("یافت نشد", { status: 404, headers: { "Cache-Control": "no-store" } });

  const data = readStoredFile(att.request_id, att.stored_name);
  if (!data) return new Response("فایل در دسترس نیست", { status: 404, headers: { "Cache-Control": "no-store" } });

  await run(
    "INSERT INTO attachment_access_logs (id, attachment_id, request_id, actor_id, actor_role, action, ip, created_at) VALUES (?,?,?,?,?,?,?,?)",
    [newId(), att.id, att.request_id, user.id, user.role, "download", ipHash(await clientIp()), nowIso()],
  );
  await logAudit({ id: user.id, name: user.name, role: user.role }, "attachment.downloaded", { type: "attachment", id: att.id }, { request: att.request_id });

  const safeName = att.original_name.replace(/[^\w.\-\u0600-\u06FF ]/g, "_") || "attachment";
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": att.mime_type || "application/octet-stream",
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(att.original_name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
