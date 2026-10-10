/**
 * پشتیبان‌گیری از پایگاه داده SQLite با VACUUM INTO (ایمن در حین کار سرویس).
 * استفاده: npm run db:backup   (خروجی در .data/backups)
 * برای PostgreSQL از pg_dump استفاده کنید؛ راهنما در docs/DEPLOY.md آمده است.
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const url = process.env.DATABASE_URL || "";
if (url.startsWith("postgres")) {
  console.error("این اسکریپت فقط برای SQLite است. برای PostgreSQL از pg_dump استفاده کنید (docs/DEPLOY.md).");
  process.exit(2);
}
const file = url.startsWith("sqlite:") ? url.slice("sqlite:".length) : url || path.join(process.cwd(), ".data", "khadamat447.db");
if (!fs.existsSync(file)) {
  console.error(`پایگاه داده پیدا نشد: ${file}`);
  process.exit(2);
}
const dir = path.join(process.cwd(), ".data", "backups");
fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(dir, `khadamat447-${stamp}.db`);
const db = new DatabaseSync(file);
db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
db.close();
fs.chmodSync(target, 0o600);
console.log(`پشتیبان ایجاد شد: ${target}`);
