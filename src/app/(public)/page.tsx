import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ButtonLink, SectionTitle } from "@/components/ui";
import { ServiceCard } from "@/components/service-card";
import { MapBlock } from "@/components/map-block";
import { Markdown } from "@/components/markdown";
import { loadSite, loadSiteWithServices, mapsUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getPublishedArticles, getPublishedFaqs } from "@/lib/queries";
import { formatFaDay } from "@/lib/utils";
import { toFaPhone } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({ title: site.homeTitle, description: site.homeDescription, path: "/", site });
}

const STEPS = [
  { title: "انتخاب خدمت", text: "خدمت موردنظر خود را از فهرست خدمات انتخاب کنید تا فرم متناسب با همان خدمت نمایش داده شود.", icon: "services" as const },
  { title: "تکمیل فرم و ارسال اطلاعات", text: "اطلاعات ضروری را در چند مرحله کوتاه وارد کنید و در صورت نیاز مدارک را بارگذاری کنید.", icon: "upload" as const },
  { title: "دریافت کد پیگیری", text: "پس از ثبت موفق، یک کد پیگیری یکتا دریافت می‌کنید. آن را ذخیره یا کپی کنید.", icon: "track" as const },
  { title: "بررسی و اطلاع‌رسانی وضعیت", text: "کارشناس دفتر درخواست را بررسی می‌کند و وضعیت آن در صفحه پیگیری نمایش داده می‌شود.", icon: "check" as const },
];

const BENEFITS = [
  { title: "ثبت درخواست در هر ساعت از شبانه‌روز", text: "فرم آنلاین همیشه در دسترس است؛ رسیدگی طبق روال کاری دفتر انجام می‌شود.", icon: "clock" as const },
  { title: "دریافت کد پیگیری", text: "برای هر درخواست یک کد اختصاصی صادر می‌شود تا بدون نیاز به تماس، وضعیت آن را دنبال کنید.", icon: "track" as const },
  { title: "امکان بارگذاری مدارک ضروری", text: "مدارک به‌صورت امن و خصوصی دریافت و فقط برای کارکنان مجاز قابل مشاهده است.", icon: "upload" as const },
  { title: "اطلاع‌رسانی درباره وضعیت درخواست", text: "در صورت فعال‌بودن کانال ارتباطی، تغییر وضعیت درخواست برای شما ارسال می‌شود.", icon: "mail" as const },
  { title: "ارسال پرس‌وجو بدون مراجعه اولیه", text: "بسیاری از پرسش‌های اولیه را پیش از مراجعه، از طریق فرم و سؤالات متداول پیگیری کنید.", icon: "chat" as const },
  { title: "دسترسی آسان به اطلاعات تماس و موقعیت", text: "شماره‌ها، نشانی و مسیریابی دفتر در همه صفحات سایت در دسترس است.", icon: "pin" as const },
];

export default async function HomePage() {
  const { site, services } = await loadSiteWithServices();
  const featured = services.filter((s) => s.featured).slice(0, 4);
  const faqs = (await getPublishedFaqs()).slice(0, 6);
  const articles = (await getPublishedArticles()).slice(0, 3);
  const phone = site.phone1;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-800 ring-1 ring-brand-200">
              <Icon name="shield" size={16} /> {site.slogan}
            </p>
            <h1 className="mt-6 text-4xl font-black leading-[1.35] text-slate-900 md:text-5xl">
              خدمات سلامت و بهداشت، <span className="text-brand-700">ساده‌تر و سریع‌تر</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-9 text-slate-600">
              خدمات دفتر سلامت ۴۷۷ را مشاهده کنید، درخواست خود را آنلاین ثبت کنید و برای پیگیری، کد اختصاصی دریافت کنید.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/request" icon="send">شروع ثبت درخواست</ButtonLink>
              <ButtonLink href="#services" variant="outline" icon="services">مشاهده خدمات</ButtonLink>
              <ButtonLink href={mapsUrl(site)} variant="outline" icon="pin" external>مسیریابی دفتر</ButtonLink>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-500">
              ثبت درخواست به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-900/20 ring-1 ring-brand-100">
              <Image
                src="/images/hero-office.jpg"
                alt="فضای داخلی و پذیرش دفتر خدمات سلامت، با میز پذیرش چوبی و نور طبیعی"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="خدمات دفتر" title="خدمات اصلی دفتر خدمات سلامت ۴۷۷" desc="برای هر خدمت، صفحه‌ای مستقل با توضیح، مراحل و مدارک موردنیاز و فرم اختصاصی ثبت درخواست وجود دارد." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="مراحل دریافت خدمات" title="چهار مرحله تا ثبت و پیگیری درخواست" />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-brand-50/50 p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-lg font-black text-white">{i + 1}</span>
                <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-8 text-amber-950">
            <strong className="font-extrabold">توجه:</strong> ثبت درخواست در این سامانه به معنی تأیید نهایی، صدور مجوز یا تکمیل فرایند اداری نیست.
            نتیجه درخواست پس از بررسی کارشناسی و طی مراحل قانونی از طریق کانال ارتباطی انتخابی شما اعلام می‌شود.
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="مزایای استفاده از سایت" title="آنچه این سامانه امکانش را فراهم می‌کند" desc="فقط قابلیت‌هایی فهرست شده‌اند که در همین سامانه پیاده‌سازی شده‌اند." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon name={b.icon} size={24} />
                </span>
                <div>
                  <h3 className="font-extrabold leading-8">{b.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Map */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-600">موقعیت دفتر</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">دفتر خدمات سلامت ۴۷۷ را پیدا کنید</h2>
            <p className="mt-4 leading-8 text-slate-600">{site.addressFull}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={mapsUrl(site)} icon="pin" external>مسیریابی در Google Maps</ButtonLink>
              {phone && <ButtonLink href={`tel:${phone}`} variant="outline" icon="phone">تماس با دفتر</ButtonLink>}
            </div>
          </div>
          <MapBlock site={site} />
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle eyebrow="پرسش‌های پرتکرار" title="سؤالات متداول" />
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details key={f.id} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    {f.question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition group-open:rotate-90">
                      <Icon name="arrowLeft" size={16} />
                    </span>
                  </summary>
                  <Markdown source={f.answer_md} className="mt-3 text-sm leading-8 text-slate-700" />
                </details>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/faq" className="font-bold text-brand-700 underline underline-offset-4">مشاهده همه سؤالات</Link>
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="آموزش و مقالات" title="راهنماهای کاربردی" />
              <Link href="/articles" className="font-bold text-brand-700">همه مقالات</Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="rounded-3xl border border-slate-200 p-6 hover:border-brand-200 hover:shadow-md">
                  <p className="text-xs font-bold text-brand-600">{a.category}</p>
                  <h3 className="mt-2 font-extrabold leading-8">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{a.excerpt}</p>
                  <p className="mt-4 text-xs text-slate-500">آخرین به‌روزرسانی: {formatFaDay(a.updated_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-l from-brand-700 to-brand-900 p-8 text-center text-white shadow-2xl shadow-brand-900/30 md:p-14">
          <h2 className="text-2xl font-black md:text-3xl">درخواست خود را آنلاین ثبت کنید</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-brand-100">
            خدمت موردنظر خود را انتخاب کنید و اطلاعات ضروری را از طریق فرم اختصاصی ارسال کنید.
          </p>
          <div className="mt-8">
            <ButtonLink href="/request" variant="light" icon="send">شروع ثبت درخواست</ButtonLink>
          </div>
          {phone && (
            <p className="mt-6 text-sm text-brand-200">
              تماس با دفتر: <a className="ltr-num font-bold text-white underline" href={`tel:${phone}`}>{toFaPhone(phone)}</a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}

