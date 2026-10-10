import { SiteHeader, type NavItem } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loadSiteWithServices } from "@/lib/site";
import { getActiveAnnouncements } from "@/lib/queries";
import { organizationJsonLd, localBusinessJsonLd, jsonLd } from "@/lib/seo";
import { Icon } from "@/components/icons";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { site, services } = await loadSiteWithServices();
  const announcements = await getActiveAnnouncements();

  const nav: NavItem[] = [
    { href: "/", label: "صفحه اصلی" },
    { href: "/services", label: "خدمات" },
    { href: "/request", label: "ثبت درخواست" },
    { href: "/articles", label: "آموزش و مقالات" },
    { href: "/faq", label: "سؤالات متداول" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس با ما" },
  ];

  return (
    <>
      <SiteHeader name={site.name} phone={site.phone1} nav={nav} />
      {announcements.length > 0 && (
        <div className="bg-amber-50 text-amber-900">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-2 text-sm">
            {announcements.map((a) => (
              <p key={a.id} className="flex items-start gap-2">
                <Icon name="alert" size={16} className="mt-1 shrink-0" />
                <span>
                  <strong>{a.title}</strong>
                  {a.body_md ? ` — ${a.body_md}` : ""}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}
      <main id="main">{children}</main>
      <SiteFooter site={site} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd(site)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.siteUrl || undefined,
            inLanguage: "fa-IR",
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessJsonLd(site)) }} />
    </>
  );
}
