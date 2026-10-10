import { requirePermission } from "@/lib/auth/guard";
import { getSettings } from "@/lib/settings";
import { SETTING_GROUPS, type SettingField } from "@/lib/settings-schema";
import { PageHeader, Card } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { Field, inputClass } from "@/components/field";
import { saveSettingsAction } from "@/app/admin/_actions/content";
import { btn } from "@/components/admin/ui";
import { emailProviderName } from "@/lib/notifications/providers/email";
import { telegramConfigured } from "@/lib/notifications/providers/telegram";
import { envOnly } from "@/lib/settings";

export const metadata = { title: "تنظیمات سایت" };

function Input({ f, value }: { f: SettingField; value: string }) {
  const common = { id: f.key, name: f.key, defaultValue: value, maxLength: f.max, className: `${inputClass} ${f.kind === "text" || f.kind === "url" || f.kind === "tel" || f.kind === "decimal" || f.kind === "extensions" || f.kind === "number" ? "text-left" : ""}`, dir: f.kind === "text" || f.kind === "textarea" || f.kind === "markdown" ? undefined : "ltr" };
  if (f.kind === "textarea" || f.kind === "markdown" || f.kind === "json") {
    return <textarea {...common} rows={f.kind === "json" ? 4 : f.kind === "markdown" ? 10 : 3} className={`${inputClass} ${f.kind !== "textarea" ? "font-mono text-sm leading-7" : ""}`} />;
  }
  const type = f.kind === "url" ? "url" : f.kind === "tel" ? "tel" : f.kind === "number" || f.kind === "decimal" ? "text" : "text";
  return <input type={type} {...common} inputMode={f.kind === "number" || f.kind === "decimal" || f.kind === "tel" ? "decimal" : undefined} />;
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("content.settings");
  const sp = await searchParams;
  const s = await getSettings();
  const envRows = [
    { label: "ایمیل مدیر اعلان‌ها (ADMIN_NOTIFICATION_EMAIL)", ok: Boolean(envOnly.adminEmail()) },
    { label: "فرستنده ایمیل (MAIL_FROM)", ok: Boolean(envOnly.mailFrom()) },
    { label: `سرویس ایمیل (${emailProviderName() === "none" ? "پیکربندی نشده" : emailProviderName()})`, ok: emailProviderName() !== "none" },
    { label: "ربات تلگرام (اختیاری)", ok: telegramConfigured() },
    { label: "نشانی عمومی سایت (NEXT_PUBLIC_SITE_URL)", ok: Boolean(envOnly.siteUrl()) },
    { label: "ایمیل عمومی دفتر (PUBLIC_CONTACT_EMAIL)", ok: Boolean(envOnly.publicEmail()) },
  ];
  return (
    <div className="space-y-8">
      <PageHeader title="تنظیمات سایت" desc="همه اطلاعات کسب‌وکار از همین بخش مدیریت می‌شوند. تغییرات بلافاصله در سراسر سایت اعمال می‌شود." />
      <Flash msg={sp.msg} err={sp.err} />

      <Card title="پیکربندی‌های محیطی (فقط خواندنی)">
        <p className="mb-4 text-sm leading-7 text-slate-600">
          ایمیل‌ها، کلیدها و رمزها فقط از متغیرهای محیطی خوانده می‌شوند و در این صفحه نمایش داده نمی‌شوند. وضعیت هر مورد:
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {envRows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span>{r.label}</span>
              <span className={`font-bold ${r.ok ? "text-emerald-700" : "text-amber-700"}`}>{r.ok ? "تنظیم شده" : "تنظیم نشده"}</span>
            </li>
          ))}
        </ul>
      </Card>

      {SETTING_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-24">
          <Card title={g.title}>
            <p className="mb-5 text-sm leading-7 text-slate-600">{g.desc}</p>
            <form action={saveSettingsAction} className="grid gap-5">
              <input type="hidden" name="group" value={g.id} />
              {g.fields.map((f) => (
                <Field key={f.key} label={f.label} name={f.key} hint={f.help}>
                  <Input f={f} value={s[f.key] ?? ""} />
                </Field>
              ))}
              <div><button type="submit" className={btn.primary}>ذخیره «{g.title}»</button></div>
            </form>
          </Card>
        </section>
      ))}
    </div>
  );
}
