import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { loadSite } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return pageMetadata({ title: "سیاست حفظ حریم خصوصی", description: "سیاست حفظ حریم خصوصی دفتر خدمات سلامت ۴۷۷ قزوین.", path: "/privacy", site });
}

export default async function Page() {
  const site = await loadSite();
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "سیاست حفظ حریم خصوصی" }]} />
      <h1 className="mt-6 text-3xl font-black md:text-4xl">سیاست حفظ حریم خصوصی</h1>
      <div className="mt-8 rounded-3xl bg-white p-6 md:p-10">
        <Markdown source={site.privacyMd} className="text-slate-800" />
        <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          این متن پیش از انتشار نهایی باید توسط مسئول حقوقی یا مرجع ذی‌صلاح بررسی و تأیید شود. نسخه فعلی از پنل مدیریت قابل ویرایش است.
        </p>
      </div>
    </section>
  );
}
