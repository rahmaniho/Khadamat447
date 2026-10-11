import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, ButtonLink } from "@/components/ui";
import { QuickTrack } from "@/components/home/quick-track";
import { Icon as IconBase } from "@/components/icons";
import { Reveal } from "@/components/ui/overlay";
import { SITE } from "@/lib/content/site";
import { getFeaturedServices } from "@/lib/content";
import { toFaDigits } from "@/lib/digits";

export function Hero() {
  const featured = getFeaturedServices().slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      {/* پس‌زمینه */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.35] dark:opacity-[0.12]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand-200/45 blur-3xl dark:bg-brand-500/10" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-gold-200/40 blur-3xl dark:bg-gold-500/10" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--page-bg)] to-transparent" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:pt-16">
        {/* متن اصلی */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="brand" icon="shieldCheck" className="px-4 py-1.5">
                دفتر خدمات سلامت و بهداشت اصناف — قزوین
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[0.7rem] font-black text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                فرم ثبت درخواست فعال است
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-[1.9rem] font-black leading-[1.55] text-ink-900 md:text-[2.7rem] md:leading-[1.45] dark:text-white">
              خدمات سلامت و بهداشت،
              <br />
              <span className="text-gradient">ساده، شفاف و قابل پیگیری</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-xl text-[0.98rem] leading-9 text-ink-600 dark:text-ink-300">
              درخواست‌های کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی را آنلاین ثبت کنید، مدارک را امن بارگذاری
              کنید و با <strong className="font-black text-ink-800 dark:text-white">کد پیگیری اختصاصی</strong> وضعیت را تا
              پایان فرایند دنبال کنید.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/request" size="lg" icon="send">
                شروع ثبت درخواست
              </ButtonLink>
              <ButtonLink href="/services" size="lg" variant="outline" icon="services">
                مشاهده خدمات
              </ButtonLink>
              <ButtonLink href="/guide" size="lg" variant="ghost" icon="book2">
                راهنمای گام‌به‌گام
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "خدمت فعال", value: "۴ خدمت", icon: "services" },
                { label: "ثبت درخواست", value: "۲۴ ساعته", icon: "clock" },
                { label: "کد پیگیری", value: "یکتا", icon: "track" },
                { label: "مدارک", value: "خصوصی", icon: "lock" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]/70 px-3.5 py-3 backdrop-blur">
                  <dt className="flex items-center gap-1.5 text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
                    <IconBase name={item.icon} size={13} className="text-brand-600 dark:text-brand-400" />
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-[0.86rem] font-black text-ink-900 dark:text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* تصویر و کارت‌های شناور */}
        <div className="relative">
          <Reveal delay={120}>
            <div className="relative mx-auto max-w-lg">
              <div className="relative aspect-[4/3.4] overflow-hidden rounded-5xl border border-[var(--border-soft)] shadow-2xl shadow-brand-900/15">
                <Image
                  src="/images/hero-office.webp"
                  alt="فضای داخلی و میز پذیرش دفتر خدمات سلامت ۴۷۷"
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" aria-hidden />

                <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-white/92 p-4 shadow-lift backdrop-blur-md dark:bg-ink-950/80">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white">
                        <Icon name="pin" size={19} />
                      </span>
                      <div>
                        <p className="text-[0.78rem] font-black text-ink-900 dark:text-white">{SITE.address}</p>
                        <p className="text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">{SITE.hoursSummary}</p>
                      </div>
                    </div>
                    <Link
                      href={SITE.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-[0.7rem] font-black text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/12 dark:text-brand-200"
                    >
                      مسیریابی
                    </Link>
                  </div>
                </div>
              </div>

              {/* کارت شناور: وضعیت درخواست */}
              <div className="absolute -bottom-6 -right-3 hidden w-56 animate-float rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-lift sm:block">
                <div className="flex items-center justify-between">
                  <span className="text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">وضعیت درخواست</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.6rem] font-black text-indigo-700 dark:bg-indigo-500/12 dark:text-indigo-300">
                    در حال بررسی
                  </span>
                </div>
                <p className="numeric mt-2 text-[0.82rem] font-black text-ink-900 dark:text-white" dir="ltr">
                  K447-۸۴۲۱X-۹M۰TK
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                  <div className="h-full w-3/5 rounded-full bg-gradient-to-l from-brand-600 to-gold-400" />
                </div>
                <p className="mt-2 text-[0.62rem] font-bold text-ink-500 dark:text-ink-400">
                  آخرین به‌روزرسانی: {toFaDigits("۲ ساعت")} پیش
                </p>
              </div>

              {/* کارت شناور: رضایت */}
              <div className="absolute -left-4 top-8 hidden animate-float-slow items-center gap-2 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 shadow-lift md:flex">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gold-50 text-gold-600 dark:bg-gold-500/12 dark:text-gold-300">
                  <Icon name="star" size={18} className="fill-gold-400 text-gold-400" />
                </span>
                <div>
                  <p className="text-[0.78rem] font-black text-ink-900 dark:text-white">{toFaDigits("۴٫۶")} از ۵</p>
                  <p className="text-[0.62rem] font-bold text-ink-500 dark:text-ink-400">رضایت مراجعان</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* پیگیری سریع */}
          <Reveal delay={200}>
            <div className="mx-auto mt-10 max-w-lg lg:mt-6">
              <QuickTrack />
            </div>
          </Reveal>

          {/* دسترسی سریع به خدمات */}
          <Reveal delay={260}>
            <div className="mx-auto mt-4 grid max-w-lg gap-2 sm:grid-cols-3">
              {featured.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)]/80 px-3 py-2.5 backdrop-blur transition-all hover:border-brand-300 hover:shadow-soft dark:hover:border-brand-400/40"
                >
                  <span className="text-lg" aria-hidden>
                    {service.emoji}
                  </span>
                  <span className="min-w-0 truncate text-[0.72rem] font-black text-ink-700 group-hover:text-brand-700 dark:text-ink-200 dark:group-hover:text-brand-300">
                    {service.title.replace("خدمات ثبت و صدور ", "")}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
