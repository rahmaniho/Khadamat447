/** نشست‌های احراز هویت: شناسه تصادفی در پایگاه داده + کوکی httpOnly امضاشده با HMAC */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { get as dbGet, run, nowIso } from "@/lib/db";
import { getSetting, setSetting } from "@/lib/settings";
import { logSecurity } from "@/lib/logger";
import type { Role } from "@/lib/constants";

export const SESSION_COOKIE = "k447_session";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

async function secret(): Promise<string> {
  const fromEnv = (process.env.SESSION_SECRET || "").trim();
  if (fromEnv.length >= 16) return fromEnv;
  const stored = await getSetting("security.session_secret");
  if (stored) return stored;
  const generated = randomBytes(48).toString("hex");
  await setSetting("security.session_secret", generated);
  if (process.env.NODE_ENV === "production") {
    logSecurity("SESSION_SECRET در متغیرهای محیطی تنظیم نشده است؛ از کلید تولیدشده در پایگاه داده استفاده شد.", {});
  }
  return generated;
}

function sign(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}

export async function createSession(user: SessionUser, meta: { ip?: string; userAgent?: string } = {}): Promise<string> {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await run(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent, ip) VALUES (?,?,?,?,?,?)",
    [id, user.id, nowIso(), expires, meta.userAgent || "", meta.ip || ""],
  );
  const key = await secret();
  return `${id}.${sign(id, key)}`;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw || !raw.includes(".")) return null;
  const [id, signature] = raw.split(".");
  if (!id || !signature) return null;
  const key = await secret();
  const expected = sign(id, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const row = await dbGet<{
    id: string; user_id: string; expires_at: string; revoked_at: string | null;
    name: string; email: string; role: string; active: number; must_change_password: number;
  }>(
    `SELECT s.id, s.user_id, s.expires_at, s.revoked_at, u.name, u.email, u.role, u.active, u.must_change_password
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    [id],
  );
  if (!row) return null;
  if (row.revoked_at) return null;
  if (!row.active) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await run("UPDATE sessions SET revoked_at = ? WHERE id = ?", [nowIso(), row.id]);
    return null;
  }
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    mustChangePassword: Boolean(Number(row.must_change_password)),
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw && raw.includes(".")) {
    const id = raw.split(".")[0];
    await run("UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL", [nowIso(), id]);
  }
  store.delete(SESSION_COOKIE);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
