import { requirePermission } from "@/lib/auth/guard";
import { getAllServicesForAdmin } from "@/lib/queries";
import { PageHeader, Card } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "مقاله جدید" };

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  await requirePermission("content.articles");
  const sp = await searchParams;
  const services = await getAllServicesForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="مقاله جدید" />
      <Flash err={sp.err} />
      <Card><ArticleForm services={services} /></Card>
    </div>
  );
}
