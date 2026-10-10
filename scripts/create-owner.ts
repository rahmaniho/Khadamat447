/**
 * ایجاد یا بازنشانی مدیر کل از خط فرمان (برای بازیابی دسترسی)
 * استفاده:
 *   ADMIN_NEW_PASSWORD='رمز-حداقل-۱۰-نویسه-با-عدد' npm run admin:create-owner -- owner@example.org "نام کاربر"
 * رمز از متغیر محیطی خوانده می‌شود تا در تاریخچه شل ذخیره نشود.
 */
import { get, run, nowIso } from "../src/lib/db/index";
import { hashPassword, passwordIssues } from "../src/lib/auth/password";
import { newId } from "../src/lib/utils";
import { ensureBootstrap } from "../src/lib/bootstrap";

const [email, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ") || "مدیر کل";
const password = process.env.ADMIN_NEW_PASSWORD || "";

if (!email || !email.includes("@")) {
  console.error("ایمیل معتبر وارد کنید.");
  process.exit(2);
}
const issues = passwordIssues(password);
if (issues.length) {
  console.error(issues.join(" "));
  process.exit(2);
}

await ensureBootstrap();
const normalized = email.trim().toLowerCase();
const existing = await get<{ id: string }>("SELECT id FROM users WHERE email = ?", [normalized]);
const hash = await hashPassword(password);
if (existing) {
  await run("UPDATE users SET password_hash = ?, role = 'owner', active = 1, must_change_password = 1, updated_at = ? WHERE id = ?", [hash, nowIso(), existing.id]);
  await run("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL", [nowIso(), existing.id]);
  console.log("رمز مدیر کل بازنشانی شد و نشست‌های او بسته شدند. در ورود بعدی باید رمز را تغییر دهد.");
} else {
  await run(
    `INSERT INTO users (id, name, email, password_hash, role, active, must_change_password, failed_attempts, created_at, updated_at)
     VALUES (?,?,?,?,'owner',1,1,0,?,?)`,
    [newId(), name, normalized, hash, nowIso(), nowIso()],
  );
  console.log("مدیر کل ایجاد شد. در ورود بعدی باید رمز را تغییر دهد.");
}
process.exit(0);
