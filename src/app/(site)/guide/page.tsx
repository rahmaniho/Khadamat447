import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Accordion } from "@/components/ui/overlay";
import { CtaBand, CheckList, PageHero, Section } from "@/components/site/section";
import { Alert, Badge, ButtonLink, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { SERVICES, FAQS } from "@/lib/content";
import { PROCESS_STEPS, SITE, TRUST_POINTS } from "@/lib/content/site";
import { jsonLd, pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "راهنمای گام‌به‌گام ثبت و پیگیری درخواست",
  description:
    "راهنمای کامل استفاده از سامانه دفتر خدمات سلامت ۴۷۷: انتخاب خدمت، تکمیل فرم، بارگذاری مدارک، دریافت کد پیگیری و پیگیری وضعیت — همراه با پاسخ پرسش‌های رایج.",
  path: "/guide",
  keywords: ["راهنمای ثبت درخواست", "آموزش استفاده", "کد پیگیری", "مدارک"],
});

const GUIDE_SECTIONS = [
  {
    id: "before",
    title: "پیش از شروع چه چیزی آماده کنیم؟",
    body: (
      <CheckList
        columns={2}
        items={[
          "شماره همراه فعال و در دسترس (برای دریافت کد پیگیری)",
          "نام و نام خانوادگی کامل و صحیح",
          "اطلاعات محل فعالیت، واحد صنفی یا سازمان",
          "تصویر مدارک هویتی مرتبط با خدمت (در صورت داشتن)",
          "توضیح کوتاه درباره آنچه لازم دارید",
          "در صورت تمدید یا پیگیری، اطلاعات درخواست قبلی",
        ]}
      />
    ),
  },
  {
    id: "steps",
    title: "پنج گام فرم آنلاین",
    body: (
      <ol className="space-y-3">
        {PROCESS_STEPS.concat([
          {
            title: "دریافت نتیجه",
            text: "پس از پایان بررسی، نتیجه در صفحه پیگیری و از طریق کانال ارتباطی انتخابی شما اعلام می‌شود.",
            icon: "checkCircle",
            duration: "پایان فرایند",
          },
        ]).map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-3xl border border-[var(--border-soft)] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-600 text-[0.8rem] font-black text-white">
              {toFaDigits(index + 1)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-ink-900 dark:text-white">{step.title}</p>
                <Badge tone="slate" size="sm">
                  {step.duration}
                </Badge>
              </div>
              <p className="mt-1 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: "tracking",
    title: "کد پیگیری چگونه کار می‌کند؟",
    body: (
      <div className="space-y-4 text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">
        <p>
          پس از ثبت موفق درخواست، یک کد اختصاصی با قالب{" "}
          <span className="numeric rounded-lg bg-[var(--surface-muted)] px-2 py-0.5 font-bold" dir="ltr">
            K447-ABCDE-FGHIJ
          </span>{" "}
          صادر می‌شود. این کد تنها راه دسترسی شما به وضعیت درخواست است.
        </p>
        <p>
          برای مشاهده وضعیت، به صفحه{" "}
          <Link href="/track" className="font-black text-brand-700 underline underline-offset-4 dark:text-brand-300">
            پیگیری درخواست
          </Link>{" "}
          بروید و کد را (به‌همراه چهار رقم آخر شماره تماس برای امنیت بیشتر) وارد کنید. همه رویدادهای عمومی درخواست به
          شکل خط زمان نمایش داده می‌شود.
        </p>
        <p>
          درخواست‌هایی که در همین مرورگر ثبت شده باشند، در{" "}
          <Link href="/my-requests" className="font-black text-brand-700 underline underline-offset-4 dark:text-brand-300">
            کارتابل من
          </Link>{" "}
          فهرست می‌شوند تا نیازی به جست‌وجو نداشته باشید.
        </p>
      </div>
    ),
  },
  {
    id: "attachments",
    title: "بارگذاری مدارک و قواعد فایل",
    body: (
      <div className="space-y-4">
        <CheckList
          columns={2}
          items={[
            "قالب‌های مجاز: PDF، JPG، JPEG، PNG و WEBP",
            "حداکثر حجم هر فایل: ۵ مگابایت",
            "حداکثر تعداد فایل: ۴ تا ۵ فایل بسته به خدمت",
            "امکان ارسال درخواست بدون فایل نیز وجود دارد",
            "مدارک در فضای خصوصی و جدا از بخش عمومی نگهداری می‌شود",
            "دسترسی کارکنان مجاز به مدارک در سابقه رویدادها ثبت می‌شود",
          ]}
        />
        <Alert tone="info" icon="lock" title="نگهداری امن مدارک">
          مدارک هرگز از طریق ایمیل ارسال نمی‌شود و در فرم‌های عمومی اطلاعات حساس مانند کد ملی دریافت نمی‌گردد.
        </Alert>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "چه اطلاعاتی دریافت می‌شود؟",
    body: (
      <CheckList
        items={[
          "نام و نام خانوادگی، شماره همراه و در صورت تمایل ایمیل",
          "نوع متقاضی (شخص حقیقی یا واحد صنفی) و نام محل فعالیت",
          "پاسخ فیلدهای اختصاصی همان خدمت",
          "توضیحات اختیاری و مدارکی که خودتان بارگذاری می‌کنید",
        ]}
      />
    ),
  },
  {
    id: "after",
    title: "پس از ثبت درخواست چه اتفاقی می‌افتد؟",
    body: (
      <div className="space-y-3 text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">
        <p>
          کارشناس دفتر درخواست را بررسی می‌کند؛ اگر اطلاعات یا مدرکی ناقص باشد، وضعیت درخواست به «نیازمند تکمیل» تغییر
          می‌کند و موارد لازم به شما اعلام می‌شود. در صورت نیاز به حضور، زمان مراجعه از طریق کانال انتخابی شما هماهنگ
          می‌شود.
        </p>
        <p>
          در پایان، نتیجه در صفحه پیگیری و در صورت فعال بودن کانال اطلاع‌رسانی، با پیامک یا ایمیل اعلام می‌گردد.
        </p>
      </div>
    ),
  },
];

export default function GuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "راهنما", href: "/guide" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="راهنمای استفاده"
        icon="book2"
        title="راهنمای گام‌به‌گام ثبت و پیگیری درخواست"
        description="هر آنچه برای ثبت درخواست، بارگذاری مدارک و پیگیری وضعیت لازم دارید — از زمان تقریبی هر گام تا قواعد فایل و نحوه دریافت نتیجه."
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "راهنما", href: "/guide" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="wizard" className="bg-white/12 text-white ring-white/25">
              پنج گام کوتاه
            </Badge>
            <Badge tone="brand" icon="clock" className="bg-white/12 text-white ring-white/25">
              ۳ تا ۵ دقیقه زمان لازم
            </Badge>
            <Badge tone="brand" icon="lock" className="bg-white/12 text-white ring-white/25">
              بدون ثبت‌نام
            </Badge>
          </>
        }
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="گام‌های فرم" value="۵ گام" icon="wizard" />
          <Metric label="زمان تقریبی" value="۳ تا ۵ دقیقه" icon="clock" tone="gold" />
          <Metric label="مدارک" value="اختیاری در شروع" icon="upload" tone="info" />
          <Metric label="پیگیری" value="۲۴ ساعته آنلاین" icon="track" tone="success" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="space-y-8">
            {GUIDE_SECTIONS.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="numeric grid h-9 w-9 place-items-center rounded-2xl bg-brand-50 text-[0.78rem] font-black text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {toFaDigits(index + 1)}
                  </span>
                  <h2 className="text-xl font-black text-ink-900 dark:text-white">{section.title}</h2>
                </div>
                <div className="mt-4">{section.body}</div>
              </section>
            ))}

            <section id="service-guides" className="scroll-mt-28">
              <h2 className="text-xl font-black text-ink-900 dark:text-white">راهنمای اختصاصی هر خدمت</h2>
              <p className="mt-2 text-[0.84rem] leading-8 text-ink-600 dark:text-ink-300">
                فهرست مدارک و مراحل هر خدمت در صفحه اختصاصی همان خدمت آمده است؛ از جدول زیر وارد شوید.
              </p>
              <div className="mt-5 space-y-3">
                {SERVICES.map((service) => (
                  <div key={service.slug} className="surface-card flex flex-wrap items-center gap-4 p-4">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white ${service.gradient}`}>
                      <Icon name={service.icon} size={21} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-ink-900 dark:text-white">{service.title}</p>
                      <p className="mt-0.5 text-[0.74rem] text-ink-500 dark:text-ink-400">
                        {service.fields.length} فیلد · تا {service.maxAttachments} مدرک · {service.duration}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink href={`/services/${service.slug}`} size="sm" variant="outline" icon="file">
                        راهنما و مدارک
                      </ButtonLink>
                      <ButtonLink href={`/request?service=${service.slug}`} size="sm" icon="send">
                        ثبت درخواست
                      </ButtonLink>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="guide-faq" className="scroll-mt-28">
              <h2 className="text-xl font-black text-ink-900 dark:text-white">پرسش‌های رایج درباره استفاده از سامانه</h2>
              <div className="mt-5">
                <Accordion
                  items={FAQS.slice(0, 6).map((faq) => ({
                    id: faq.id,
                    title: faq.question,
                    icon: "chat",
                    content: <div className="text-[0.84rem] leading-8 text-ink-600 dark:text-ink-300">{faq.plainAnswer}</div>,
                  }))}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="layers" size={18} className="text-brand-600 dark:text-brand-400" />
                فهرست این راهنما
              </h2>
              <ol className="mt-3 space-y-1.5">
                {GUIDE_SECTIONS.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-[0.76rem] font-bold text-ink-600 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-300 dark:hover:bg-brand-500/10"
                    >
                      <span className="numeric mt-0.5 shrink-0 text-ink-400">{toFaDigits(index + 1)}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#service-guides"
                    className="flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-[0.76rem] font-bold text-ink-600 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-300 dark:hover:bg-brand-500/10"
                  >
                    <span className="numeric mt-0.5 shrink-0 text-ink-400">{toFaDigits(GUIDE_SECTIONS.length + 1)}.</span>
                    راهنمای اختصاصی هر خدمت
                  </a>
                </li>
              </ol>
            </Card>

            <Card className="space-y-3 p-5">
              <h2 className="font-black text-ink-900 dark:text-white">شروع سریع</h2>
              <ButtonLink href="/request" icon="send" full>
                ثبت درخواست آنلاین
              </ButtonLink>
              <ButtonLink href="/track" variant="outline" icon="track" full>
                پیگیری درخواست
              </ButtonLink>
              <ButtonLink href="/faq" variant="ghost" icon="chat" full>
                پرسش‌های متداول
              </ButtonLink>
            </Card>

            <Card className="space-y-3 bg-[var(--surface-muted)]/60 p-5">
              <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
                <Icon name="shieldCheck" size={18} className="text-brand-600 dark:text-brand-400" />
                تعهدات ما
              </h2>
              <CheckList items={TRUST_POINTS.slice(0, 4)} />
            </Card>

            <Card className="space-y-2 p-5">
              <h2 className="font-black text-ink-900 dark:text-white">تماس با دفتر</h2>
              {SITE.phones.map((phone) => (
                <a
                  key={phone.value}
                  href={`tel:${phone.value}`}
                  className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-[0.78rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                >
                  <Icon name="phone" size={15} className="text-brand-600 dark:text-brand-400" />
                  <span className="numeric">{toFaDigits(phone.display)}</span>
                </a>
              ))}
              <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400">{SITE.hoursSummary}</p>
            </Card>
          </aside>
        </div>
      </Section>

      <CtaBand
        title="همه‌چیز روشن است؟ شروع کنیم"
        description="خدمت موردنظر خود را انتخاب کنید و در چند گام کوتاه درخواست را ثبت کنید."
        secondary={{ href: "/services", label: "مشاهده خدمات", icon: "services" }}
      />
    </>
  );
}
