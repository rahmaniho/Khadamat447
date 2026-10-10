import type { Metadata } from "next";
import { ServiceCard } from "@/components/service-card";
import { Breadcrumbs, SectionTitle, ButtonLink } from "@/components/ui";
import { loadSiteWithServices } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await loadSiteWithServices();
  return pageMetadata({
    title: "خدمات دفتر خدمات سلامت ۴۷۷ قزوین",
    description: "فهرست خدمات دفتر خدمات سلامت ۴۷۷ در قزوین: کارت بهداشت، آموزش بهداشت اصناف، صدور صلاحیت بهداشت و قراردادهای ممیزی.",
    path: "/services",
    site,
  });
}

export default async function ServicesPage() {
  const { services } = await loadSiteWithServices();
  const main = services.filter((s) => s.featured);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Breadcrumbs items={[{ label: "خدمات" }]} />
      <div className="mt-6">
        <SectionTitle eyebrow="خدمات دفتر" title="خدمات دفتر خدمات سلامت ۴۷۷" desc="هر خدمت صفحه اختصاصی دارد که مراحل، مدارک و سؤالات متداول آن را توضیح می‌دهد." />
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {main.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
      {services.some((s) => !s.featured) && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {services.filter((s) => !s.featured).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
      <div className="mt-14 text-center">
        <ButtonLink href="/request" icon="send">ثبت درخواست آنلاین</ButtonLink>
      </div>
    </section>
  );
}
