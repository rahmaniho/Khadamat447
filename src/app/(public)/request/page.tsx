import type { Metadata } from "next";
import { RequestWizard, type WizardService } from "@/components/request-wizard";
import { Breadcrumbs, SectionTitle, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { loadSite } from "@/lib/site";
import { ensureBootstrap } from "@/lib/bootstrap";
import { getActiveServices, getServiceFields } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { uploadLimitsFromSettings } from "@/lib/files";
import { pageMetadata } from "@/lib/seo";
import { toFaPhone } from "@/lib/site";
import { IS_STATIC } from "@/lib/static-data";

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
  // در حالت static: بدون searchParams و بدون wizard (فرم واقعی نیاز به سرور دارد)
  if (IS_STATIC) {
    return <RequestStaticView />;
  }
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

/**
 * نسخه‌ی نمایشی صفحه‌ی ثبت درخواست برای حالت static export (GitHub Pages).
 * فرم کامل نیاز به سرور Node.js و پایگاه داده دارد؛ در حالت static فقط
 * اطلاعات خدمات و راهنمای ثبت درخواست نمایش داده می‌شود.
 */
async function RequestStaticView() {
  const services = await getActiveServices();
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
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <Icon name="alert" size={24} className="mt-1 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-lg font-extrabold text-amber-900">این صفحه فقط نمایشی است</h2>
              <p className="mt-2 leading-8 text-amber-800">
                ثبت درخواست، بارگذاری مدارک و دریافت کد پیگیری فقط در نسخه‌ی کامل سایت (با سرور و پایگاه داده) فعال است.
                برای ثبت درخواست، لطفاً از طریق یکی از راه‌های زیر اقدام کنید:
              </p>
              <ul className="mt-4 space-y-2 text-amber-900">
                <li className="flex items-center gap-2"><Icon name="phone" size={18} /> تماس با شماره‌های دفتر (صفحه «تماس با ما»)</li>
                <li className="flex items-center gap-2"><Icon name="mail" size={18} /> ارسال ایمیل به Info@Khadamat447.IR</li>
                <li className="flex items-center gap-2"><Icon name="pin" size={18} /> مراجعه حضوری به نشانی دفتر</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/contact" icon="phone">راه‌های تماس</ButtonLink>
                <ButtonLink href="/services" icon="services" variant="outline">مشاهده خدمات</ButtonLink>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <SectionTitle eyebrow="خدمات قابل ثبت" title="چه خدماتی را می‌توان درخواست کرد؟" />
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-extrabold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-7 text-slate-600">{s.tagline}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <SectionTitle title="ثبت درخواست تأیید نهایی نیست" desc="نتیجه درخواست پس از بررسی کارشناسی و طی مراحل قانونی اعلام می‌شود." />
        </div>
      </section>
    </>
  );
}
