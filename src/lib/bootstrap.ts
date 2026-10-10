/**
 * راه‌اندازی خودکار سامانه
 * ---------------------------------------------------------------
 * در اولین دسترسی به پایگاه داده: ساخت جدول‌ها، درج تنظیمات و محتوای اولیه
 * و ساخت نخستین کاربر مدیر. این تابع idempotent است.
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { get as dbGet, run, nowIso } from "@/lib/db";
import { seedDatabase } from "@/lib/db/seed";
import { ensureSettingsSeeded } from "@/lib/settings";
import { hashPassword } from "@/lib/auth/password";
import { newId } from "@/lib/utils";
import { logInfo, logWarn } from "@/lib/logger";

interface BootState {
  done: boolean;
  promise: Promise<void> | null;
}
const g = globalThis as unknown as { __k447boot?: BootState };
if (!g.__k447boot) g.__k447boot = { done: false, promise: null };

async function ensureAdminUser(): Promise<void> {
  const count = await dbGet<{ c: number }>("SELECT COUNT(*) AS c FROM users");
  if (Number(count?.c || 0) > 0) return;

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const fromEnvPassword = (process.env.ADMIN_PASSWORD || "").trim();
  const generated = !fromEnvPassword;
  const password = fromEnvPassword || randomBytes(12).toString("base64url");

  await run(
    `INSERT INTO users (id, name, email, password_hash, role, active, must_change_password, failed_attempts, created_at, updated_at)
     VALUES (?,?,?,?,?,1,?,0,?,?)`,
    [
      newId(), "مدیر سامانه", email || "admin@localhost.local", await hashPassword(password),
      "owner", generated ? 1 : 0, nowIso(), nowIso(),
    ],
  );

  if (generated) {
    // رمز اولیه هرگز در لاگ چاپ نمی‌شود؛ در فایلی با دسترسی محدود ذخیره می‌شود
    const dir = path.join(process.cwd(), ".data");
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = path.join(dir, "INITIAL_ADMIN_PASSWORD.txt");
    fs.writeFileSync(file, `ایمیل ورود: ${email || "admin@localhost.local"}\nرمز اولیه: ${password}\nپس از اولین ورود، رمز را تغییر دهید و این فایل را حذف کنید.\n`, { mode: 0o600 });
    logWarn("کاربر مدیر اولیه ساخته شد. اطلاعات ورود در فایل .data/INITIAL_ADMIN_PASSWORD.txt است (پس از اولین ورود حذف کنید).", {
      email: email || "admin@localhost.local",
      hint: "برای تعیین رمز دلخواه، ADMIN_EMAIL و ADMIN_PASSWORD را در .env تنظیم کنید.",
    });
  } else {
    logInfo("کاربر مدیر اولیه از متغیرهای محیطی ساخته شد", { email });
  }
}

async function bootstrap(): Promise<void> {
  await ensureSettingsSeeded();
  await seedDatabase();
  await ensureAdminUser();
  logInfo("راه‌اندازی سامانه انجام شد");
}

export async function ensureBootstrap(): Promise<void> {
  if (g.__k447boot!.done) return;
  if (!g.__k447boot!.promise) {
    g.__k447boot!.promise = bootstrap()
      .then(() => {
        g.__k447boot!.done = true;
      })
      .catch((e) => {
        g.__k447boot!.promise = null;
        throw e;
      });
  }
  return g.__k447boot!.promise;
}
