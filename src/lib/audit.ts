/** ثبت سابقه رویدادهای مهم (Audit Log) */
import { all, run, nowIso } from "@/lib/db";
import { newId } from "@/lib/utils";

export interface AuditActor {
  id?: string;
  name?: string;
  role?: string;
}

export async function logAudit(
  actor: AuditActor,
  action: string,
  entity: { type?: string; id?: string } = {},
  meta: Record<string, unknown> = {},
  ip = "",
): Promise<void> {
  await run(
    `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, meta_json, ip, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      newId(), actor.id || "", actor.name || "", actor.role || "", action,
      entity.type || "", entity.id || "", JSON.stringify(meta), ip, nowIso(),
    ],
  );
}

export interface AuditLogRow {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  meta_json: string;
  ip: string;
  created_at: string;
}

export async function recentAuditLogs(limit = 50, entityType?: string): Promise<AuditLogRow[]> {
  if (entityType) {
    return all<AuditLogRow>(
      "SELECT * FROM audit_logs WHERE entity_type = ? ORDER BY created_at DESC LIMIT ?",
      [entityType, limit],
    );
  }
  return all<AuditLogRow>("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", [limit]);
}
