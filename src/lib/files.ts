/**
 * ذخیره‌سازی امن فایل‌های بارگذاری‌شده
 * ---------------------------------------------------------------
 * - فایل‌ها بیرون از پوشه عمومی (public) نگهداری می‌شوند
 * - نام فایل به‌صورت تصادفی تولید می‌شود و نام اصلی فقط برای نمایش ذخیره می‌شود
 * - نوع واقعی فایل با بررسی بایت‌های آغازین (magic bytes) تأیید می‌شود
 * - فایل‌های اجرایی و قالب‌های ناشناخته پذیرفته نمی‌شوند
 */
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_ALLOWED_EXTENSIONS, DEFAULT_MAX_FILE_BYTES } from "@/lib/constants";

export interface UploadLimits {
  maxBytes: number;
  allowedExtensions: string[];
  maxFiles: number;
}

export function uploadLimitsFromSettings(settings: Record<string, string>): UploadLimits {
  const maxMb = Number(settings["form.max_file_mb"]) || DEFAULT_MAX_FILE_BYTES / (1024 * 1024);
  const exts = (settings["form.allowed_extensions"] || DEFAULT_ALLOWED_EXTENSIONS.join(","))
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .map((e) => (e.startsWith(".") ? e : `.${e}`));
  const maxFiles = Number(settings["form.max_files_per_request"]) || 4;
  return { maxBytes: Math.round(maxMb * 1024 * 1024), allowedExtensions: exts, maxFiles };
}

export function storageRoot(): string {
  const fromEnv = (process.env.STORAGE_DIR || "").trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), ".data", "uploads");
}

export function requestStorageDir(requestId: string): string {
  const safe = requestId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(storageRoot(), safe);
}

interface Signature {
  mime: string;
  ext: string;
  test: (b: Buffer) => boolean;
}

const SIGNATURES: Signature[] = [
  { mime: "application/pdf", ext: ".pdf", test: (b) => b.length > 4 && b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { mime: "image/jpeg", ext: ".jpg", test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: ".png",
    test: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: "image/webp",
    ext: ".webp",
    test: (b) => b.length > 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
];

export interface DetectedFile {
  ok: true;
  mime: string;
  ext: string;
}
export interface RejectedFile {
  ok: false;
  reason: string;
}

export function detectFileType(buffer: Buffer, originalName: string): DetectedFile | RejectedFile {
  const match = SIGNATURES.find((s) => s.test(buffer));
  if (!match) return { ok: false, reason: "نوع فایل قابل شناسایی نیست. تنها فایل PDF یا تصویر (JPG، PNG، WEBP) پذیرفته می‌شود." };
  const ext = path.extname(originalName || "").toLowerCase();
  if (ext && ext !== match.ext && !(ext === ".jpeg" && match.ext === ".jpg")) {
    return { ok: false, reason: "پسوند فایل با محتوای واقعی آن هم‌خوانی ندارد." };
  }
  return { ok: true, mime: match.mime, ext: match.ext };
}

export function sanitizeOriginalName(name: string): string {
  const base = path.basename(String(name || "").replace(/\\/g, "/")).replace(/[\u0000-\u001f<>:"/\\|?*]/g, "");
  const trimmed = base.replace(/^\.+/, "").slice(0, 120);
  return trimmed || "file";
}

export interface SavedFile {
  storedName: string;
  originalName: string;
  mime: string;
  sizeBytes: number;
  sha256: string;
  absolutePath: string;
}

export async function saveUpload(
  file: File,
  requestId: string,
  limits: UploadLimits,
): Promise<{ ok: true; file: SavedFile } | { ok: false; reason: string }> {
  const originalName = sanitizeOriginalName(file.name);
  const ext = path.extname(originalName).toLowerCase();
  if (!limits.allowedExtensions.includes(ext)) {
    return { ok: false, reason: `قالب «${ext || "بدون پسوند"}» مجاز نیست. قالب‌های مجاز: ${limits.allowedExtensions.join("، ")}` };
  }
  if (file.size > limits.maxBytes) {
    return { ok: false, reason: `حجم فایل بیشتر از حد مجاز (${Math.round(limits.maxBytes / (1024 * 1024))} مگابایت) است.` };
  }
  if (file.size === 0) return { ok: false, reason: "فایل ارسالی خالی است." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectFileType(buffer, originalName);
  if (!detected.ok) return { ok: false, reason: detected.reason };

  const storedName = `${randomUUID()}${detected.ext}`;
  const dir = requestStorageDir(requestId);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const absolutePath = path.join(dir, storedName);
  fs.writeFileSync(absolutePath, buffer, { mode: 0o600 });

  return {
    ok: true,
    file: {
      storedName,
      originalName,
      mime: detected.mime,
      sizeBytes: buffer.length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      absolutePath,
    },
  };
}

export function readStoredFile(requestId: string, storedName: string): Buffer | null {
  const safe = storedName.replace(/[^a-zA-Z0-9._-]/g, "");
  const full = path.join(requestStorageDir(requestId), safe);
  const root = storageRoot();
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(root))) return null; // جلوگیری از path traversal
  if (!fs.existsSync(resolved)) return null;
  return fs.readFileSync(resolved);
}

export function deleteStoredFile(requestId: string, storedName: string): boolean {
  const safe = storedName.replace(/[^a-zA-Z0-9._-]/g, "");
  const full = path.resolve(path.join(requestStorageDir(requestId), safe));
  if (!full.startsWith(path.resolve(storageRoot()))) return false;
  if (!fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}
