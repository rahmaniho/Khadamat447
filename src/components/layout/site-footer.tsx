import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { FOOTER_LINKS, SITE } from "@/lib/content/site";
import { toFaDigits } from "@/lib/digits";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-brand-50/70 to-transparent dark:from-brand-500/5" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          {/* معرفی */}
          <div>
            <Logo size={46} />
            <p className="mt-5 max-w-md text-[0.86rem] leading-8 text-ink-600 dark:text-ink-300">{SITE.description}</p>

            <div className="mt-6 space-y-2.5 text-[0.8rem] font-bold text-ink-700 dark:text-ink-200">
              <p className="flex items-start gap-2.5">
                <Icon name="pin" size={17} className="mt-1 shrink-0 text-brand-600 dark:text-brand-400" />
                {SITE.addressFull}
              </p>
              <p className="flex items-center gap-2.5">
                <Icon name="clock" size={17} className="shrink-0 text-brand-600 dark:text-brand-400" />
                {SITE.hoursSummary}
              </p>
              <a className="flex items-center gap-2.5 transition hover:text-brand-700 dark:hover:text-brand-300" href={`mailto:${SITE.email}`}>
                <Icon name="mail" size={17} className="shrink-0 text-brand-600 dark:text-brand-400" />
                {SITE.emailDisplay}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {SITE.phones.map((p) => (
                <a
                  key={p.value}
                  href={`tel:${p.value}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3.5 py-2 text-[0.78rem] font-black text-ink-800 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-100 dark:hover:border-brand-400/40 dark:hover:text-brand-200"
                >
                  <Icon name="phone" size={15} className="text-brand-600 dark:text-brand-400" />
                  <span className="numeric">{toFaDigits(p.display)}</span>
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              {SITE.social.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-200"
                >
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* پیوندها */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[0.82rem] font-black text-ink-900 dark:text-white">{group.title}</h3>
                <span className="mt-2 block h-1 w-8 rounded-full bg-gradient-to-l from-brand-500 to-gold-400" />
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[0.79rem] font-bold text-ink-600 transition hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-200"
                      >
                        <span className="h-1 w-1 rounded-full bg-ink-300 transition-all group-hover:w-3 group-hover:bg-brand-500" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* خبرنامه و تعهدنامه‌ها */}
        <div className="mt-12 grid gap-6 rounded-4xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-ink-900 dark:text-white">
              <Icon name="bell" size={19} className="text-brand-600 dark:text-brand-400" />
              اطلاع از دوره‌ها و به‌روزرسانی راهنماها
            </h3>
            <p className="mt-2 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">
              فقط پیام‌های مربوط به خدمات و زمان برگزاری دوره‌ها ارسال می‌شود؛ بدون تبلیغ و بدون ارسال به دیگران.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border-soft)] pt-6 text-[0.74rem] font-bold text-ink-500 dark:text-ink-400 md:flex-row md:items-center md:justify-between">
          <p className="leading-7">
            © {toFaDigits(year)} تمامی حقوق برای {SITE.name} محفوظ است. ثبت درخواست آنلاین به معنی تأیید نهایی یا صدور مجوز نیست.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-brand-700 dark:hover:text-brand-300">
              حریم خصوصی
            </Link>
            <Link href="/terms" className="transition hover:text-brand-700 dark:hover:text-brand-300">
              شرایط استفاده
            </Link>
            <Link href="/status" className="transition hover:text-brand-700 dark:hover:text-brand-300">
              وضعیت سامانه
            </Link>
            <Link href="/sitemap.xml" className="transition hover:text-brand-700 dark:hover:text-brand-300">
              نقشه سایت
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
