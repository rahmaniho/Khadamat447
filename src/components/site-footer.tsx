import Link from "next/link";
import type { PublicSiteConfig } from "@/lib/settings";
import { Icon } from "@/components/icons";
import { toFaPhone } from "@/lib/site";

export function SiteFooter({ site, services }: { site: PublicSiteConfig; services: Array<{ slug: string; title: string }> }) {
  const year = new Intl.DateTimeFormat("fa-IR-u-nu-arab", { year: "numeric" }).format(new Date());
  return (
    <footer className="mt-20 bg-brand-900 text-brand-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-white">{site.name}</p>
          <p className="mt-2 text-sm leading-7 text-brand-200">{site.slogan}</p>
          <p className="mt-4 text-sm leading-7 text-brand-100">{site.addressFull}</p>
          <a
            href={site.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4"
          >
            <Icon name="pin" size={18} /> مسیریابی در Google Maps
          </a>
        </div>

        <div>
          <p className="font-bold text-white">خدمات</p>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/request" className="font-semibold text-white hover:underline">
                ثبت درخواست آنلاین
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">راهنما و اطلاعات</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/guide" className="hover:text-white">راهنمای ثبت درخواست</Link></li>
            <li><Link href="/articles" className="hover:text-white">آموزش و مقالات</Link></li>
            <li><Link href="/faq" className="hover:text-white">سؤالات متداول</Link></li>
            <li><Link href="/track" className="hover:text-white">پیگیری درخواست</Link></li>
            <li><Link href="/terms" className="hover:text-white">قوانین و مقررات</Link></li>
            <li><Link href="/privacy" className="hover:text-white">سیاست حفظ حریم خصوصی</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">راه‌های ارتباطی</p>
          <ul className="mt-4 space-y-3 text-sm">
            {site.phone1 && (
              <li>
                <a href={`tel:${site.phone1}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Icon name="phone" size={16} /> <span className="ltr-num">{toFaPhone(site.phone1)}</span>
                </a>
              </li>
            )}
            {site.phone2 && (
              <li>
                <a href={`tel:${site.phone2}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Icon name="phone" size={16} /> <span className="ltr-num">{toFaPhone(site.phone2)}</span>
                </a>
              </li>
            )}
            {site.publicEmail ? (
              <li>
                <a href={`mailto:${site.publicEmail}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Icon name="mail" size={16} /> {site.publicEmail}
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/contact" className="hover:text-white">صفحه تماس و موقعیت دفتر</Link>
            </li>
          </ul>
          {site.social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {site.social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-brand-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-brand-200 md:flex-row md:justify-between">
          <p>© {year} {site.name}. تمام حقوق محفوظ است.</p>
          <p>ثبت درخواست در این سامانه به معنی تأیید نهایی یا صدور مجوز نیست.</p>
        </div>
      </div>
    </footer>
  );
}
