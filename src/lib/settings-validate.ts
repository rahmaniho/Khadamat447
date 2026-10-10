import { SETTING_GROUPS, type SettingField } from "@/lib/settings-schema";
import { isAnyPhone, normalizePhone, toEnDigits } from "@/lib/utils";

const SAFE_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

/** اعتبارسنجی و پاک‌سازی یک مقدار تنظیمات؛ خروجی: مقدار نهایی یا خطا */
export function validateSettingValue(field: SettingField, raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const v = toEnDigits(String(raw ?? "")).replace(/\r\n/g, "\n").trim();
  const label = field.label;
  if (field.max && v.length > field.max) return { ok: false, error: `«${label}» بیش از ${field.max} نویسه است.` };

  switch (field.kind) {
    case "text":
    case "textarea":
    case "markdown":
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) return { ok: false, error: `«${label}» نویسه غیرمجاز دارد.` };
      return { ok: true, value: v };
    case "url":
      if (!v) return { ok: true, value: "" };
      if (!/^https:\/\/[^\s]+$/i.test(v) && !(field.key === "business.map_url" && /^https:\/\/www\.google\.com\/maps/i.test(v))) {
        return { ok: false, error: `«${label}» باید با https:// شروع شود.` };
      }
      return { ok: true, value: v };
    case "tel":
      if (!v) return { ok: true, value: "" };
      if (!isAnyPhone(v)) return { ok: false, error: `«${label}» معتبر نیست.` };
      return { ok: true, value: normalizePhone(v) };
    case "decimal": {
      const n = Number(v);
      if (!Number.isFinite(n) || Math.abs(n) > 180) return { ok: false, error: `«${label}» عدد معتبر نیست.` };
      return { ok: true, value: String(n) };
    }
    case "number": {
      if (!v) return { ok: true, value: "" };
      const n = Number(v);
      if (!/^\d+(\.\d+)?$/.test(v) || !Number.isFinite(n)) return { ok: false, error: `«${label}» باید عدد باشد.` };
      if (field.key === "form.max_file_mb" && (n < 1 || n > 20)) return { ok: false, error: "حداکثر حجم فایل باید بین ۱ تا ۲۰ مگابایت باشد." };
      if (field.key === "form.max_files_per_request" && (n < 1 || n > 10)) return { ok: false, error: "تعداد فایل باید بین ۱ تا ۱۰ باشد." };
      return { ok: true, value: String(Math.round(n * 100) / 100) };
    }
    case "extensions": {
      const parts = v
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .map((x) => (x.startsWith(".") ? x : `.${x}`));
      if (parts.length === 0) return { ok: false, error: "حداقل یک قالب مجاز انتخاب کنید." };
      const bad = parts.filter((p) => !SAFE_EXT.includes(p));
      if (bad.length) return { ok: false, error: `قالب‌های غیرمجاز: ${bad.join("، ")}` };
      return { ok: true, value: Array.from(new Set(parts)).join(",") };
    }
    case "json": {
      if (!v) return { ok: true, value: "[]" };
      try {
        const parsed = JSON.parse(v);
        if (!Array.isArray(parsed)) return { ok: false, error: `«${label}» باید یک آرایه JSON باشد.` };
        if (field.key === "business.social_json") {
          for (const item of parsed) {
            if (!item || typeof item.label !== "string" || typeof item.url !== "string" || !/^https:\/\//.test(item.url)) {
              return { ok: false, error: "هر مورد شبکه اجتماعی باید label و url با https:// داشته باشد." };
            }
          }
        }
        if (field.key === "business.hours_json") {
          for (const item of parsed) {
            if (!item || typeof item.day !== "string" || typeof item.hours !== "string" || typeof item.closed !== "boolean") {
              return { ok: false, error: "هر مورد ساعت کاری باید day، hours و closed داشته باشد." };
            }
          }
        }
        return { ok: true, value: JSON.stringify(parsed) };
      } catch {
        return { ok: false, error: `«${label}» JSON معتبر نیست.` };
      }
    }
  }
  return { ok: false, error: "نوع تنظیمات ناشناخته است." };
}

export function fieldByKey(key: string): SettingField | undefined {
  for (const g of SETTING_GROUPS) {
    const f = g.fields.find((x) => x.key === key);
    if (f) return f;
  }
  return undefined;
}
