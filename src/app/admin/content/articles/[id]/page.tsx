import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getArticlesForAdmin, getAllServicesForAdmin } from "@/lib/queries";
import { get } from "@/lib/db";
import { PageHeader, Card } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "ویرایش مقاله" };

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("content.articles");
  const { id } = await params;
  const sp = await searchParams;
  const all = await getArticlesForAdmin();
  const a = all.find((x) => x.id === id);
  if (!a) {
    const exists = await get("SELECT id FROM articles WHERE id = ?", [id]);
    if (!exists) notFound();
  }
  const services = await getAllServicesForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title={`ویرایش: ${a?.title ?? ""}`} />
      <Flash msg={sp.msg} err={sp.err} />
      <Card>
        <ArticleForm
          services={services}
          article={{
            id: a?.id,
            slug: a?.slug,
            title: a?.title,
            excerpt: a?.excerpt,
            body_md: a?.body_md,
            author: a?.author,
            category: a?.category,
            status: a?.status,
            seo_title: a?.seo_title,
            seo_description: a?.seo_description,
            review_note: a?.review_note,
            related_services: a?.related_services,
          }}
        />
      </Card>
    </div>
  );
}
