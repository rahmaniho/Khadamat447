import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, ButtonLink } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { loadSite } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({ title: "درباره ما", description: `معرفی ${site.name} در ${site.city}، خدمات، ماموریت و راه‌های ارتباط با دفتر.`, path: "/about", site });
}

export default async function AboutPage() {
  const site = await loadSite();
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "درباره ما" }]} />
      <h1 className="mt-6 text-3xl font-black md:text-4xl">درباره دفتر خدمات سلامت ۴۷۷</h1>
      <p className="mt-3 text-lg leading-8 text-brand-800">{site.slogan}</p>
      <div className="mt-8 rounded-3xl bg-white p-6 md:p-10">
        <Markdown source={site.aboutMd} className="text-slate-800" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/services" className="rounded-2xl border border-slate-200 bg-white p-6 font-bold text-brand-800 hover:border-brand-200">مشاهده خدمات دفتر ←</Link>
        <Link href="/contact" className="rounded-2xl border border-slate-200 bg-white p-6 font-bold text-brand-800 hover:border-brand-200">نشانی و تماس با دفتر ←</Link>
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/request" icon="send">ثبت درخواست آنلاین</ButtonLink>
      </div>
    </section>
  );
}
