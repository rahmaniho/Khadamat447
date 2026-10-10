import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getArticlesForAdmin } from "@/lib/queries";
import { PageHeader, Card, Badge, btn, EmptyState } from "@/components/admin/ui";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "مقالات آموزشی" };

export default async function AdminArticlesPage() {
  await requirePermission("content.articles");
  const articles = await getArticlesForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="مقالات آموزشی" actions={<Link href="/admin/content/articles/new" className={btn.primary}>مقاله جدید</Link>} />
      <Card>
        {articles.length === 0 ? <EmptyState>مقاله‌ای وجود ندارد.</EmptyState> : (
          <ul className="divide-y divide-slate-100">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-extrabold">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.category || "بدون دسته"} · آخرین به‌روزرسانی: {formatFaDate(a.updated_at)}</p>
                  <div className="mt-2 flex gap-2">
                    {a.status === "published" ? <Badge>منتشر شده</Badge> : <Badge tone="amber">پیش‌نویس</Badge>}
                    {a.review_note && <Badge tone="slate">{a.review_note}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/content/articles/${a.id}/preview`} className={btn.ghost}>پیش‌نمایش</Link>
                  <Link href={`/admin/content/articles/${a.id}`} className={btn.ghost}>ویرایش</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
