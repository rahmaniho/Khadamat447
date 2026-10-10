import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapBlock } from "@/components/map-block";
import { loadSite, mapsUrl, toFaPhone } from "@/lib/site";
import { pageMetadata, localBusinessJsonLd, jsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({
    title: "تماس با ما و موقعیت دفتر",
    description: `نشانی، شماره تماس، ساعات کاری و مسیریابی دفتر خدمات سلامت ۴۷۷ در ${site.city}.`,
    path: "/contact",
    site,
  });
}

export default async function ContactPage() {
  const site = await loadSite();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Breadcrumbs items={[{ label: "تماس با ما" }]} />
      <h1 className="mt-6 text-3xl font-black md:text-4xl">تماس با دفتر خدمات سلامت ۴۷۷</h1>
      <p className="mt-3 max-w-2xl leading-8 text-slate-600">برای پرسش یا هماهنگی، با شماره‌های زیر تماس بگیرید یا از طریق فرم، درخواست خود را ثبت کنید.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Icon name="pin" size={22} className="text-brand-700" /> نشانی</h2>
            <p className="mt-3 leading-8 text-slate-700">{site.addressFull}</p>
            <a href={mapsUrl(site)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white">
              <Icon name="pin" size={18} /> مسیریابی در Google Maps
            </a>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Icon name="phone" size={22} className="text-brand-700" /> شماره‌های تماس</h2>
            <ul className="mt-4 space-y-3">
              {site.phone1 && <li><a href={`tel:${site.phone1}`} className="ltr-num text-lg font-black text-brand-800">{toFaPhone(site.phone1)}</a></li>}
              {site.phone2 && <li><a href={`tel:${site.phone2}`} className="ltr-num text-lg font-black text-brand-800">{toFaPhone(site.phone2)}</a></li>}
            </ul>
            {site.publicEmail && (
              <p className="mt-4 flex items-center gap-2 text-slate-700"><Icon name="mail" size={18} /> <a className="font-bold underline" href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a></p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Icon name="clock" size={22} className="text-brand-700" /> ساعات کاری</h2>
            {site.hours.length > 0 ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4 py-3 text-sm">
                    <span className="font-bold">{h.day}</span>
                    <span className={h.closed ? "text-rose-700" : "text-slate-700"}>{h.hours}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-600">ساعات کاری رسمی دفتر به‌زودی در این صفحه درج می‌شود. برای اطلاع از ساعات کاری با شماره‌های تماس دفتر هماهنگ کنید.</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 text-center">
            <h2 className="text-lg font-extrabold">کد QR مسیریابی</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/qr" width={180} height={180} alt={`کد QR مسیریابی به موقعیت ${site.name} در Google Maps`} className="mx-auto mt-4 rounded-xl" loading="lazy" />
            <p className="mt-3 text-xs text-slate-500">با دوربین تلفن همراه اسکن کنید.</p>
          </div>
        </div>

        <div className="space-y-6">
          <MapBlock site={site} />
          <div className="rounded-3xl bg-brand-700 p-8 text-center text-white">
            <p className="text-lg font-bold">درخواست خود را آنلاین ثبت کنید</p>
            <div className="mt-5"><ButtonLink href="/request" variant="light" icon="send">شروع ثبت درخواست</ButtonLink></div>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessJsonLd(site)) }} />
    </section>
  );
}
