import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getArticlesForAdmin } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Alert, Badge } from "@/components/ui";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "پیش‌نمایش مقاله", robots: { index: false, follow: false } };

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.articles");
  const { id } = await params;
  const a = (await getArticlesForAdmin()).find((x) => x.id === id);
  if (!a) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/content/articles/${a.id}`} className="font-bold text-brand-700">← بازگشت به ویرایش</Link>
        {a.status === "published" ? <Badge>منتشر شده</Badge> : <Badge tone="amber">پیش‌نویس — عمومی نیست</Badge>}
      </div>
      <Alert tone="info">این پیش‌نمایش فقط برای مدیران است و نمایش عمومی ندارد.</Alert>
      <article className="rounded-3xl bg-white p-6 md:p-10">
        <p className="text-sm font-bold text-brand-600">{a.category}</p>
        <h1 className="mt-2 text-3xl font-black leading-[1.5]">{a.title}</h1>
        <p className="mt-3 text-sm text-slate-500">به‌روزرسانی: {formatFaDate(a.updated_at)}</p>
        {a.excerpt && <p className="mt-4 text-lg leading-9 text-slate-700">{a.excerpt}</p>}
        <div className="mt-8"><Markdown source={a.body_md} className="text-slate-800" /></div>
      </article>
    </div>
  );
}
