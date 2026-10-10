import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { Breadcrumbs, Badge, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapBlock } from "@/components/map-block";
import { loadSite, loadSiteWithServices, mapsUrl, toFaPhone } from "@/lib/site";
import { getServiceBySlug, getServiceFields, getPublishedFaqs, getPublishedArticles } from "@/lib/queries";
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { formatFaDay } from "@/lib/utils";
import { stripMarkdown } from "@/lib/markdown";

type Params = Promise<{ slug: string }>;

/** لیست اسلاگ‌ها برای ساخت صفحات static در build-time (GitHub Pages) */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const { getActiveServices } = await import("@/lib/queries");
  const services = await getActiveServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadSite();
  const svc = await getServiceBySlug(slug);
  if (!svc) return { title: "خدمت یافت نشد" };
  return pageMetadata({
    title: svc.seo_title || svc.title,
    description: svc.seo_description || svc.summary,
    path: `/services/${svc.slug}`,
    site,
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const { site, services } = await loadSiteWithServices();
  const svc = await getServiceBySlug(slug);
  if (!svc) notFound();

  const fields = await getServiceFields(svc.id);
  const faqs = (await getPublishedFaqs(svc.slug)).filter((f) => f.service_slug === svc.slug);
  const related = services.filter((s) => s.slug !== svc.slug && s.featured).slice(0, 3);
  const articles = (await getPublishedArticles()).filter((a) => a.related_services.includes(svc.slug)).slice(0, 4);
  const phone = site.phone1;

  const sections = [
    { id: "intro", title: "معرفی خدمت", body: svc.intro_md },
    { id: "audience", title: "مخاطبان این خدمت", body: svc.audience_md },
    { id: "process", title: "مراحل ثبت درخواست", body: svc.process_md },
    { id: "documents", title: "مدارک موردنیاز", body: svc.documents_md },
  ].filter((s) => s.body && s.body.trim());

  const jsonService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.title,
    description: stripMarkdown(svc.summary || svc.intro_md).slice(0, 300),
    serviceType: svc.title,
    provider: { "@type": "Organization", name: site.name },
    areaServed: { "@type": "City", name: site.city },
    url: site.siteUrl ? `${site.siteUrl}/services/${svc.slug}` : undefined,
  };

  return (
    <>
      <section className="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <Breadcrumbs items={[{ label: "خدمات", href: "/services" }, { label: svc.title }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h1 className="text-3xl font-black leading-[1.5] md:text-4xl">{svc.title}</h1>
              {svc.tagline && <p className="mt-3 text-lg leading-8 text-brand-800">{svc.tagline}</p>}
              <p className="mt-4 leading-8 text-slate-700">{svc.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/request?service=${svc.slug}`} icon="send">ثبت درخواست این خدمت</ButtonLink>
                {phone && <ButtonLink href={`tel:${phone}`} variant="outline" icon="phone">تماس با دفتر</ButtonLink>}
              </div>
            </div>
            <aside className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-2 font-extrabold"><Icon name="shield" size={20} className="text-brand-700" /> وضعیت محتوا</p>
              {svc.reviewed_at ? (
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  آخرین بازبینی محتوا: <span className="font-bold">{formatFaDay(svc.reviewed_at)}</span>
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  <Badge tone="amber">در انتظار بازبینی نهایی دفتر</Badge>
                  <p className="text-sm leading-7 text-slate-600">فهرست مدارک و الزامات این خدمت پیش از تأیید نهایی دفتر، راهنما محسوب می‌شود.</p>
                </div>
              )}
              <p className="mt-4 text-sm leading-7 text-slate-600">ثبت درخواست به معنی تأیید نهایی یا صدور مجوز نیست.</p>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-extrabold text-slate-900">{s.title}</h2>
              <Markdown source={s.body} className="mt-4 text-slate-700" />
            </section>
          ))}

          {fields.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-extrabold">اطلاعات لازم در فرم این خدمت</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {fields.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <Icon name="check" size={16} className="text-brand-700" />
                    {f.label}
                    {f.required && <span className="text-xs text-rose-600">(الزامی)</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section id="faq" className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-extrabold">سؤالات متداول این خدمت</h2>
              <div className="mt-5 space-y-3">
                {faqs.map((f) => (
                  <details key={f.id} className="group rounded-2xl border border-slate-200 p-4">
                    <summary className="cursor-pointer list-none font-bold">{f.question}</summary>
                    <Markdown source={f.answer_md} className="mt-3 text-sm leading-8 text-slate-700" />
                  </details>
                ))}
              </div>
            </section>
          )}

          {articles.length > 0 && (
            <section aria-labelledby="service-articles" className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 id="service-articles" className="text-2xl font-extrabold">مقالات آموزشی درباره {svc.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">پیش از ثبت درخواست، این راهنماها را مطالعه کنید تا اطلاعات و مدارک مورد نیاز را بهتر آماده کنید.</p>
              <ul className="mt-6 grid gap-5 md:grid-cols-2">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/articles/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 hover:border-brand-200 hover:shadow-md">
                      {a.cover_path && (
                        <span className="relative block aspect-video bg-brand-50">
                          <Image src={a.cover_path} alt={`تصویر آموزشی: ${a.title}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
                        </span>
                      )}
                      <span className="flex flex-1 flex-col p-5">
                        <span className="font-extrabold leading-8 text-slate-900">{a.title}</span>
                        <span className="mt-2 text-sm leading-7 text-slate-600">{a.excerpt}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-3xl bg-brand-700 p-8 text-center text-white">
            <h2 className="text-2xl font-black">درخواست {svc.title} را ثبت کنید</h2>
            <p className="mx-auto mt-3 max-w-xl leading-8 text-brand-100">فرم اختصاصی این خدمت را تکمیل کنید و کد پیگیری دریافت کنید.</p>
            <div className="mt-6">
              <ButtonLink href={`/request?service=${svc.slug}`} variant="light" icon="send">شروع ثبت درخواست</ButtonLink>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">موقعیت دفتر و تماس</h2>
            <div className="mt-4">
              <MapBlock site={site} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold">اطلاعات تماس</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {site.phone1 && <li><a className="flex items-center gap-2 font-bold text-brand-800" href={`tel:${site.phone1}`}><Icon name="phone" size={16} /> <span className="ltr-num">{toFaPhone(site.phone1)}</span></a></li>}
              {site.phone2 && <li><a className="flex items-center gap-2 font-bold text-brand-800" href={`tel:${site.phone2}`}><Icon name="phone" size={16} /> <span className="ltr-num">{toFaPhone(site.phone2)}</span></a></li>}
              <li className="flex gap-2 leading-7 text-slate-700"><Icon name="pin" size={16} className="mt-1 shrink-0" /> {site.addressFull}</li>
            </ul>
            <a href={mapsUrl(site)} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white">
              <Icon name="pin" size={16} /> مسیریابی در Google Maps
            </a>
          </div>

          {related.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="font-extrabold">خدمات مرتبط</h2>
              <ul className="mt-4 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/services/${r.slug}`} className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(jsonService) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "صفحه اصلی", url: site.siteUrl || "/" },
              { name: "خدمات", url: `${site.siteUrl}/services` },
              { name: svc.title, url: `${site.siteUrl}/services/${svc.slug}` },
            ]),
          ),
        }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(faqJsonLd(faqs.map((f) => ({ question: f.question, answer: stripMarkdown(f.answer_md) })))),
          }}
        />
      )}
    </>
  );
}
