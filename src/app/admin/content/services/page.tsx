import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getAllServicesForAdmin } from "@/lib/queries";
import { PageHeader, Card, Badge, btn } from "@/components/admin/ui";
import { formatFaDate } from "@/lib/utils";

export const metadata = { title: "مدیریت خدمات" };

export default async function AdminServicesPage() {
  await requirePermission("content.services");
  const services = await getAllServicesForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="مدیریت خدمات" desc="ویرایش عنوان، توضیحات، مدارک، فیلدهای فرم و متن سئو. خدمات جدید را می‌توان با افزودن رکورد در پایگاه داده و تنظیم فیلدها اضافه کرد." />
      <Card>
        <ul className="divide-y divide-slate-100">
          {services.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-extrabold">{s.title}</p>
                <p className="ltr-num text-xs text-slate-500" dir="ltr">/services/{s.slug}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!s.active && <Badge tone="slate">غیرفعال</Badge>}
                  {s.reviewed_at ? <Badge>بازبینی: {formatFaDate(s.reviewed_at, false)}</Badge> : <Badge tone="amber">نیازمند بازبینی دفتر</Badge>}
                </div>
              </div>
              <Link href={`/admin/content/services/${s.id}`} className={btn.ghost}>ویرایش</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
