import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";
import { Breadcrumbs } from "@/components/ui";
import { loadSite } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return {
    ...pageMetadata({ title: "پیگیری درخواست", description: "پیگیری وضعیت درخواست با کد پیگیری و چهار رقم آخر شماره تماس.", path: "/track", site, noindex: true }),
  };
}

export default function TrackPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Breadcrumbs items={[{ label: "پیگیری درخواست" }]} />
      <h1 className="mt-4 text-3xl font-black">پیگیری درخواست</h1>
      <p className="mt-3 leading-8 text-slate-600">
        کد پیگیری دریافت‌شده و چهار رقم آخر شماره تماسی را که با آن درخواست را ثبت کرده‌اید وارد کنید تا وضعیت درخواست نمایش داده شود.
      </p>
      <div className="mt-8">
        <TrackForm />
      </div>
    </section>
  );
}
