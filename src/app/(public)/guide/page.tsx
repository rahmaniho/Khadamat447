import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { loadSite } from "@/lib/site";
import { getArticleBySlug } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

const SLUG = "how-to-submit-a-request";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  const a = await getArticleBySlug(SLUG);
  return pageMetadata({
    title: a?.seo_title || "راهنمای ثبت درخواست",
    description: a?.seo_description || "راهنمای ثبت درخواست آنلاین در دفتر خدمات سلامت ۴۷۷.",
    path: "/guide",
    site,
  });
}

export default async function GuidePage() {
  const a = await getArticleBySlug(SLUG);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "راهنمای ثبت درخواست" }]} />
      <h1 className="mt-6 text-3xl font-black md:text-4xl">راهنمای ثبت درخواست</h1>
      <div className="mt-8 rounded-3xl bg-white p-6 md:p-10">
        {a && a.status === "published" ? (
          <Markdown source={a.body_md} className="text-slate-800" />
        ) : (
          <p className="text-slate-600">راهنمای ثبت درخواست هنوز منتشر نشده است.</p>
        )}
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/request" icon="send">شروع ثبت درخواست</ButtonLink>
      </div>
    </section>
  );
}
