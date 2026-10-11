import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CtaBand, CheckList, PageHero, Section } from "@/components/site/section";
import { Avatar, Badge, ButtonLink, Card, Metric, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/overlay";
import { MILESTONES, SITE, TEAM, TRUST_POINTS, VALUES } from "@/lib/content/site";
import { SERVICES, ARTICLES, FAQS } from "@/lib/content";
import { jsonLd, pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { toFaDigits } from "@/lib/digits";

export const metadata: Metadata = pageMetadata({
  title: "درباره دفتر خدمات سلامت ۴۷۷",
  description:
    "معرفی دفتر خدمات سلامت ۴۷۷ قزوین: حوزه فعالیت، ارزش‌ها، روش کار و تیم دفتر — همراه با اطلاعات تماس و نشانی دفتر.",
  path: "/about",
  keywords: ["درباره دفتر", "خدمات سلامت ۴۷۷", "قزوین", "معرفی"],
});

const ACTIVITY_AREAS = [
  { icon: "card", title: "کارت بهداشت", text: "ثبت درخواست، تمدید و پیگیری کارت بهداشت شاغلان صنوف و اماکن عمومی." },
  { icon: "book", title: "آموزش بهداشت اصناف", text: "هماهنگی دوره‌ها و کارگاه‌های آموزشی بهداشت برای اصناف و کارکنان." },
  { icon: "badge", title: "صلاحیت بهداشت", text: "بررسی مدارک و پیگیری پرونده صدور یا تمدید صلاحیت واحدها." },
  { icon: "clipboard", title: "ممیزی و قرارداد", text: "هماهنگی ممیزی بهداشتی، چک‌لیست آمادگی و بازبینی قراردادهای خدمات." },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "خانه", href: "/" },
              { name: "درباره ما", href: "/about" },
            ]),
          ),
        }}
      />

      <PageHero
        eyebrow="درباره دفتر"
        icon="badge"
        title={SITE.name}
        description={SITE.description}
        breadcrumbs={[
          { name: "خانه", href: "/" },
          { name: "درباره ما", href: "/about" },
        ]}
        actions={
          <>
            <Badge tone="brand" icon="pin" className="bg-white/12 text-white ring-white/25">
              {SITE.city}، {SITE.province}
            </Badge>
            <Badge tone="brand" icon="services" className="bg-white/12 text-white ring-white/25">
              {toFaDigits(SERVICES.length)} خدمت فعال
            </Badge>
            <Badge tone="brand" icon="clock" className="bg-white/12 text-white ring-white/25">
              {SITE.hoursSummary}
            </Badge>
          </>
        }
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              align="start"
              eyebrow="حوزه فعالیت"
              icon="target"
              title="چه کاری انجام می‌دهیم؟"
              description="دفتر خدمات سلامت ۴۷۷ در قزوین، فرایند ثبت، پیگیری و هماهنگی درخواست‌های مرتبط با بهداشت و سلامت اصناف را برای متقاضیان و واحدهای صنفی انجام می‌دهد."
            />
            <p className="mt-5 text-[0.88rem] leading-9 text-ink-600 dark:text-ink-300">
              تمرکز ما بر سه چیز است: اینکه بدانید برای هر خدمت دقیقاً چه مدارکی لازم است، در هر لحظه بدانید درخواست شما
              در چه مرحله‌ای قرار دارد، و لازم نباشد برای پرسش‌های ساده چند بار مراجعه کنید.
            </p>
            <div className="mt-7">
              <CheckList
                columns={2}
                items={[
                  "ثبت و پیگیری درخواست‌های خدمات بهداشتی",
                  "راهنمای مدارک و شرایط هر خدمت",
                  "هماهنگی مراجعه حضوری در صورت نیاز",
                  "اطلاع‌رسانی وضعیت تا پایان فرایند",
                ]}
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/services" icon="services">
                مشاهده خدمات
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" icon="pin">
                نشانی و تماس
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-4xl border border-[var(--border-soft)] shadow-lift">
              <Image
                src="/images/hero-office.webp"
                alt="میز پذیرش و فضای داخلی دفتر خدمات سلامت ۴۷۷"
                fill
                sizes="(min-width:1024px) 44vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Metric label="سالن انتظار و پذیرش" value="در طبقه ششم برج خلیج فارس" icon="building" />
              <Metric label="ساعات کاری" value={SITE.hoursSummary} icon="clock" tone="gold" />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="حوزه‌های خدمت"
          icon="layers"
          title="خدماتی که در دفتر انجام می‌شود"
          description="هر حوزه صفحه اختصاصی خود را دارد؛ با ورود به هر بخش، مدارک، مراحل و فرم ثبت درخواست آن را می‌بینید."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITY_AREAS.map((area, index) => (
            <Reveal key={area.title} delay={index * 70}>
              <Card className="h-full p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon name={area.icon} size={21} />
                </span>
                <h3 className="mt-4 font-black text-ink-900 dark:text-white">{area.title}</h3>
                <p className="mt-1.5 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{area.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              align="start"
              eyebrow="ارزش‌های ما"
              icon="shieldCheck"
              title="چهار اصلی که در کار رعایت می‌کنیم"
              description="این اصول در طراحی سامانه و در روال کاری دفتر رعایت می‌شود."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <Card key={value.title} className="p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon name={value.icon} size={19} />
                  </span>
                  <h3 className="mt-3 font-black text-ink-900 dark:text-white">{value.title}</h3>
                  <p className="mt-1 text-[0.76rem] leading-6 text-ink-600 dark:text-ink-300">{value.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              align="start"
              eyebrow="مسیر کار"
              icon="wizard"
              title="از دریافت درخواست تا اعلام نتیجه"
              description="هر مرحله زمان تقریبی مشخصی دارد و وضعیت آن در صفحه پیگیری قابل مشاهده است."
            />
            <ol className="mt-7 space-y-3">
              {MILESTONES.map((step, index) => (
                <li key={step.title} className="surface-card relative flex gap-4 p-5">
                  <span className="numeric grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-[0.8rem] font-black text-white">
                    {toFaDigits(index + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black text-ink-900 dark:text-white">{step.title}</p>
                      <Badge tone="brand" size="sm">
                        {step.tag}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="تیم دفتر"
          icon="users"
          title="افرادی که درخواست شما را پیگیری می‌کنند"
          description="درخواست‌ها بسته به موضوع، به کارشناس مربوطه سپرده می‌شود و نام مسئول بررسی در صفحه پیگیری نمایش داده می‌شود."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member, index) => (
            <Reveal key={member.name} delay={index * 70}>
              <Card className="h-full p-5 text-center">
                <span className="mx-auto block w-fit">
                  <Avatar name={member.initials} color={["#1e7a71", "#d4901c", "#2563eb", "#059669"][index % 4]} size="lg" />
                </span>
                <h3 className="mt-4 font-black text-ink-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-[0.72rem] font-bold text-brand-700 dark:text-brand-300">{member.role}</p>
                <p className="mt-2 text-[0.76rem] leading-6 text-ink-600 dark:text-ink-300">{member.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-6 md:p-8">
            <SectionHeading
              align="start"
              eyebrow="تعهدات ما"
              icon="lock"
              title="امنیت و حریم خصوصی، بخشی از طراحی است"
              description="این موارد در ساختار سامانه رعایت شده است، نه فقط در متن قوانین."
            />
            <div className="mt-6">
              <CheckList items={TRUST_POINTS} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/privacy" variant="outline" size="sm" icon="shieldCheck">
                سیاست حریم خصوصی
              </ButtonLink>
              <ButtonLink href="/terms" variant="ghost" size="sm" icon="file">
                شرایط استفاده
              </ButtonLink>
              <ButtonLink href="/status" variant="ghost" size="sm" icon="activity">
                وضعیت سامانه
              </ButtonLink>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-black text-ink-900 dark:text-white">سامانه در یک نگاه</h3>
              <dl className="mt-4 space-y-3 text-[0.8rem]">
                {[
                  { label: "خدمات با فرم اختصاصی", value: toFaDigits(SERVICES.length) },
                  { label: "مقالات آموزشی", value: toFaDigits(ARTICLES.length) },
                  { label: "پرسش‌های متداول", value: toFaDigits(FAQS.length) },
                  { label: "پیگیری آنلاین", value: "۲۴ ساعته" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-muted)]/70 px-4 py-2.5">
                    <dt className="font-bold text-ink-500 dark:text-ink-400">{row.label}</dt>
                    <dd className="font-black text-ink-900 dark:text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="space-y-3 p-6">
              <h3 className="font-black text-ink-900 dark:text-white">تماس با دفتر</h3>
              <p className="flex items-start gap-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
                <Icon name="pin" size={17} className="mt-1 shrink-0 text-brand-600 dark:text-brand-400" />
                {SITE.addressFull}
              </p>
              {SITE.phones.map((phone) => (
                <a
                  key={phone.value}
                  href={`tel:${phone.value}`}
                  className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-3.5 py-2.5 text-[0.8rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
                >
                  <Icon name="phone" size={16} className="text-brand-600 dark:text-brand-400" />
                  <span className="numeric">{toFaDigits(phone.display)}</span>
                </a>
              ))}
              <Link href="/contact" className="text-[0.78rem] font-black text-brand-700 hover:underline dark:text-brand-300">
                نقشه و مسیریابی دفتر
              </Link>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand
        title="درخواست خود را ثبت کنید"
        description="خدمت موردنظر خود را انتخاب کنید و در چند گام کوتاه درخواست را ثبت کنید؛ کد پیگیری همان لحظه صادر می‌شود."
        secondary={{ href: "/contact", label: "تماس و نشانی", icon: "pin" }}
      />
    </>
  );
}
