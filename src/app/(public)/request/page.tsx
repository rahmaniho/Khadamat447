import type { Metadata } from "next";
import { RequestWizard, type WizardService } from "@/components/request-wizard";
import { Breadcrumbs, SectionTitle } from "@/components/ui";
import { loadSite } from "@/lib/site";
import { ensureBootstrap } from "@/lib/bootstrap";
import { getActiveServices, getServiceFields } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { uploadLimitsFromSettings } from "@/lib/files";
import { pageMetadata } from "@/lib/seo";
import { toFaPhone } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({
    title: "ثبت درخواست آنلاین",
    description: "ثبت درخواست آنلاین خدمات دفتر خدمات سلامت ۴۷۷ قزوین؛ انتخاب خدمت، تکمیل فرم چندمرحله‌ای، بارگذاری مدارک و دریافت کد پیگیری.",
    path: "/request",
    site,
  });
}

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  await ensureBootstrap();
  const { service } = await searchParams;
  const site = await loadSite();
  const settings = await getSettings();
  const limits = uploadLimitsFromSettings(settings);
  const services = await getActiveServices();

  const wizardServices: WizardService[] = [];
  for (const s of services) {
    const fields = await getServiceFields(s.id);
    wizardServices.push({
      slug: s.slug,
      title: s.title,
      tagline: s.tagline,
      icon: s.icon,
      allowAttachments: s.allow_attachments,
      maxAttachments: Math.min(s.max_attachments, limits.maxFiles),
      documentsMd: s.documents_md,
      reviewed: Boolean(s.reviewed_at),
      fields: fields.map((f) => ({
        key: f.field_key,
        label: f.label,
        type: f.type,
        options: f.options,
        placeholder: f.placeholder,
        helpText: f.help_text,
        required: f.required,
      })),
    });
  }

  const retentionDays = settings["policy.retention_days"];
  const retentionText = retentionDays
    ? `اطلاعات شما حداکثر به مدت ${toFaPhone(retentionDays)} روز پس از پایان رسیدگی نگهداری می‌شود. ${settings["policy.consent_text"]}`
    : `مدت نگهداری اطلاعات و شیوه حذف آن در سیاست حفظ حریم خصوصی توضیح داده شده است. ${settings["policy.consent_text"]}`;

  return (
    <>
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Breadcrumbs items={[{ label: "ثبت درخواست" }]} />
          <h1 className="mt-4 text-3xl font-black md:text-4xl">ثبت درخواست آنلاین</h1>
          <p className="mt-3 leading-8 text-slate-600">
            خدمت موردنظر خود را انتخاب کنید، اطلاعات ضروری را در چند مرحله وارد کنید و در پایان کد پیگیری دریافت کنید.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-10">
          {services.length === 0 ? (
            <p className="text-slate-600">در حال حاضر خدمتی برای ثبت درخواست فعال نیست.</p>
          ) : (
            <RequestWizard
              services={wizardServices}
              initialService={service || ""}
              config={{
                maxFileMb: limits.maxBytes / (1024 * 1024),
                allowedExtensions: limits.allowedExtensions,
                retentionText,
                privacyText: settings["policy.consent_text"],
                contactPhone: site.phone1 ? toFaPhone(site.phone1) : "",
              }}
            />
          )}
        </div>
        <div className="mt-8">
          <SectionTitle title="ثبت درخواست تأیید نهایی نیست" desc="نتیجه درخواست پس از بررسی کارشناسی و طی مراحل قانونی اعلام می‌شود. برای پیگیری از صفحه «پیگیری درخواست» استفاده کنید." />
        </div>
      </section>
    </>
  );
}
