"use client";

/**
 * مدیریت محتوا (خدمات، پرسش‌ها، مقالات، اطلاعیه‌ها)
 * ---------------------------------------------------------------
 * ویرایش درجا با ذخیره در فروشگاه مرورگر؛ همراه با پیش‌نمایش،
 * شمارش بازدید، دسته‌بندی و امکان انتشار یا پیش‌نویس.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Alert, Kbd, Avatar, Badge, Button, ButtonLink, Card, Chip, EmptyState } from "@/components/ui/primitives";
import { Modal, ConfirmDialog, Tooltip } from "@/components/ui/overlay";
import { Input, Select, Textarea, Switch } from "@/components/ui/form";
import { AdminPageHeader, PermissionNotice, TableShell } from "@/components/admin/shell";
import { useStore } from "@/lib/store/store";
import type { ArticleRecord, FaqRecord, ServiceRecord, AnnouncementRecord } from "@/lib/store/types";
import { fa, faNumber, formatDate, readingTime, stripMarkdown, timeAgo, truncateText } from "@/lib/format";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ *
 * خدمات
 * ------------------------------------------------------------------ */

export function ServicesManager() {
  const { state, can, updateService, toast } = useStore();
  const [editing, setEditing] = useState<ServiceRecord | null>(null);

  if (!can("content.manage")) return <PermissionNotice permission="content.manage" />;

  return (
    <div>
      <AdminPageHeader
        title="مدیریت خدمات"
        description="عنوان، توضیح، فیلدهای فرم، مدارک لازم و وضعیت نمایش هر خدمت را ویرایش کنید. تغییرات بلافاصله در فرم ثبت درخواست اعمال می‌شود."
        icon="services"
        actions={
          <ButtonLink href="/services" size="sm" variant="outline" icon="external" external>
            مشاهده در سایت
          </ButtonLink>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {state.services.map((service) => (
            <Card key={service.slug} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white"
                    style={{ background: `linear-gradient(135deg, ${service.accent}, ${service.accent}bb)` }}
                  >
                    <Icon name={service.icon} size={22} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-ink-900 dark:text-white">{service.title}</h2>
                      {service.popular && (
                        <Badge tone="gold" size="sm" icon="star">
                          پرطرفدار
                        </Badge>
                      )}
                      <Badge tone={service.active ? "emerald" : "slate"} size="sm" dot>
                        {service.active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[0.74rem] font-bold text-ink-500 dark:text-ink-400">{service.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={service.active}
                    onChange={(checked) => {
                      updateService(service.slug, { active: checked });
                      toast.info(checked ? `«${service.title}» فعال شد` : `«${service.title}» غیرفعال شد`);
                    }}
                    label="نمایش در سایت"
                  />
                </div>
              </div>

              <p className="mt-3 text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">{truncateText(service.summary, 160)}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "فیلدهای فرم", value: faNumber(service.fields.length), icon: "wizard" },
                  { label: "مدارک لازم", value: faNumber(service.deliverables.length), icon: "folder" },
                  { label: "درخواست‌ها", value: faNumber(service.requestsCount), icon: "inbox" },
                  { label: "حداکثر فایل", value: faNumber(service.maxAttachments), icon: "upload" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                    <Icon name={item.icon} size={16} className="text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="text-[0.64rem] font-bold text-ink-500 dark:text-ink-400">{item.label}</p>
                      <p className="numeric text-[0.8rem] font-black text-ink-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-4">
                <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(service)}>
                  ویرایش متن و فیلدها
                </Button>
                <ButtonLink href={`/services/${service.slug}`} size="sm" variant="ghost" icon="external" external>
                  صفحه خدمت
                </ButtonLink>
                <ButtonLink href={`/request?service=${service.slug}`} size="sm" variant="ghost" icon="send" external>
                  فرم این خدمت
                </ButtonLink>
                <span className="ms-auto text-[0.66rem] font-bold text-ink-400">آخرین ویرایش: {timeAgo(service.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-black text-ink-900 dark:text-white">راهنمای مدیریت خدمات</h2>
            <ul className="mt-3 space-y-2.5 text-[0.76rem] leading-7 text-ink-600 dark:text-ink-300">
              <li className="flex gap-2">
                <Icon name="check" size={15} className="mt-1.5 shrink-0 text-brand-600" />
                عنوان و توضیح هر خدمت در صفحه خدمات، صفحه اختصاصی خدمت و فرم ثبت درخواست استفاده می‌شود.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={15} className="mt-1.5 shrink-0 text-brand-600" />
                فیلدهای فرم به سه گروه «متقاضی»، «اطلاعات خدمت» و «تکمیلی» تقسیم می‌شوند.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={15} className="mt-1.5 shrink-0 text-brand-600" />
                غیرفعال کردن خدمت، آن را از فرم عمومی حذف می‌کند اما پرونده‌های موجود دست‌نخورده می‌مانند.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={15} className="mt-1.5 shrink-0 text-brand-600" />
                برای هر خدمت می‌توانید حداکثر تعداد فایل و بازه زمانی تقریبی را تعیین کنید.
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-black text-ink-900 dark:text-white">وضعیت کلی محتوا</h2>
            <dl className="mt-3 space-y-2 text-[0.76rem]">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                <dt className="font-bold text-ink-500 dark:text-ink-400">خدمات فعال</dt>
                <dd className="numeric font-black text-ink-900 dark:text-white">
                  {faNumber(state.services.filter((s) => s.active).length)} از {faNumber(state.services.length)}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                <dt className="font-bold text-ink-500 dark:text-ink-400">مجموع فیلدها</dt>
                <dd className="numeric font-black text-ink-900 dark:text-white">
                  {faNumber(state.services.reduce((sum, s) => sum + s.fields.length, 0))}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                <dt className="font-bold text-ink-500 dark:text-ink-400">مجموع درخواست‌ها</dt>
                <dd className="numeric font-black text-ink-900 dark:text-white">
                  {faNumber(state.services.reduce((sum, s) => sum + s.requestsCount, 0))}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <ServiceEditor
        service={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (!editing) return;
          updateService(editing.slug, patch);
          toast.success("تغییرات خدمت ذخیره شد");
          setEditing(null);
        }}
      />
    </div>
  );
}

function ServiceEditor({
  service,
  onClose,
  onSave,
}: {
  service: ServiceRecord | null;
  onClose: () => void;
  onSave: (patch: Partial<ServiceRecord>) => void;
}) {
  const [draft, setDraft] = useState<ServiceRecord | null>(service);
  const [fieldDraft, setFieldDraft] = useState<{ label: string; type: string; required: boolean }>({ label: "", type: "text", required: false });

  useEffect(() => {
    setDraft(service);
  }, [service]);

  if (!service || !draft) return null;

  return (
    <Modal open={Boolean(service)} onClose={onClose} title={`ویرایش «${service.title}»`} size="lg">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="عنوان خدمت" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Input label="شعار کوتاه" value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
        </div>
        <Textarea label="توضیح کامل" rows={4} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="آیکون"
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            options={[
              { value: "card", label: "کارت سلامت" },
              { value: "book", label: "آموزش" },
              { value: "badge", label: "صلاحیت" },
              { value: "clipboard", label: "ممیزی و قرارداد" },
              { value: "sparkles", label: "سایر خدمات" },
            ]}
          />
          <Input label="رنگ اصلی (HEX)" value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} dir="ltr" />
          <Input label="بازه زمانی تقریبی" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
          <Input label="مخاطبان" value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} />
        </div>

        <Textarea
          label="مدارک لازم (هر مورد در یک خط)"
          rows={4}
          value={draft.deliverables.join("\n")}
          onChange={(e) => setDraft({ ...draft, deliverables: e.target.value.split("\n").filter(Boolean) })}
        />
        <Textarea
          label="نکات کلیدی (هر مورد در یک خط)"
          rows={4}
          value={draft.highlights.join("\n")}
          onChange={(e) => setDraft({ ...draft, highlights: e.target.value.split("\n").filter(Boolean) })}
        />

        <div>
          <p className="text-[0.78rem] font-black text-ink-800 dark:text-ink-100">فیلدهای اختصاصی فرم ({faNumber(draft.fields.length)})</p>
          <ul className="mt-3 space-y-2">
            {draft.fields.map((field) => (
              <li key={field.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-soft)] p-3">
                <span className="text-[0.76rem] font-black text-ink-900 dark:text-white">{field.label}</span>
                <Badge tone="slate" size="sm">
                  {field.type}
                </Badge>
                {field.required && (
                  <Badge tone="rose" size="sm">
                    الزامی
                  </Badge>
                )}
                <Badge tone="info" size="sm">
                  {field.group === "applicant" ? "متقاضی" : field.group === "service" ? "خدمت" : "تکمیلی"}
                </Badge>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, fields: draft.fields.filter((f) => f.id !== field.id) })}
                  className="ms-auto rounded-xl px-2 py-1 text-[0.68rem] font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:items-end">
            <Input label="فیلد جدید" value={fieldDraft.label} onChange={(e) => setFieldDraft({ ...fieldDraft, label: e.target.value })} placeholder="مثلاً: کد اقتصادی" />
            <Select
              label="نوع"
              value={fieldDraft.type}
              onChange={(e) => setFieldDraft({ ...fieldDraft, type: e.target.value })}
              options={[
                { value: "text", label: "متن" },
                { value: "number", label: "عدد" },
                { value: "tel", label: "تلفن" },
                { value: "textarea", label: "متن بلند" },
              ]}
            />
            <Switch checked={fieldDraft.required} onChange={(checked) => setFieldDraft({ ...fieldDraft, required: checked })} label="الزامی" />
            <Button
              size="sm"
              icon="plus"
              disabled={fieldDraft.label.trim().length < 2}
              onClick={() => {
                setDraft({
                  ...draft,
                  fields: [
                    ...draft.fields,
                    {
                      id: `f-${Date.now().toString(36)}`,
                      key: `field_${Date.now().toString(36)}`,
                      label: fieldDraft.label.trim(),
                      type: fieldDraft.type as "text" | "number" | "tel" | "textarea",
                      required: fieldDraft.required,
                      group: "extra",
                    },
                  ],
                });
                setFieldDraft({ label: "", type: "text", required: false });
              }}
            >
              افزودن
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--border-soft)] pt-4">
          <Button
            icon="save"
            onClick={() =>
              onSave({
                title: draft.title,
                tagline: draft.tagline,
                summary: draft.summary,
                icon: draft.icon,
                accent: draft.accent,
                duration: draft.duration,
                audience: draft.audience,
                deliverables: draft.deliverables,
                highlights: draft.highlights,
                fields: draft.fields,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            ذخیره تغییرات
          </Button>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <span className="ms-auto text-[0.68rem] font-bold text-ink-400">تغییرات فقط در همین مرورگر ذخیره می‌شود.</span>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * پرسش‌های متداول
 * ------------------------------------------------------------------ */

export function FaqsManager() {
  const { state, can, saveFaq, deleteFaq, toast } = useStore();
  const [editing, setEditing] = useState<FaqRecord | null>(null);
  const [removing, setRemoving] = useState<FaqRecord | null>(null);
  const [filter, setFilter] = useState("all");

  const categories = useMemo(() => Array.from(new Set(state.faqs.map((faq) => faq.category))), [state.faqs]);
  const rows = useMemo(
    () => (filter === "all" ? state.faqs : state.faqs.filter((faq) => faq.category === filter)),
    [state.faqs, filter],
  );

  if (!can("content.manage")) return <PermissionNotice permission="content.manage" />;

  const blank = (): FaqRecord => ({
    id: `faq-${Date.now().toString(36)}`,
    question: "",
    answer: "",
    category: categories[0] ?? "عمومی",
    serviceSlug: null,
    published: true,
    pinned: false,
    views: 0,
    helpful: 0,
    updatedAt: new Date().toISOString(),
  });

  return (
    <div>
      <AdminPageHeader
        title="پرسش‌های متداول"
        description="پرسش‌های پرتکرار مراجعان را مدیریت کنید؛ پرسش‌ها در صفحه «پرسش‌های متداول»، صفحه هر خدمت و نتایج جست‌وجو نمایش داده می‌شوند."
        icon="chat"
        actions={
          <>
            <ButtonLink href="/faq" size="sm" variant="outline" icon="external" external>
              مشاهده در سایت
            </ButtonLink>
            <Button size="sm" icon="plus" onClick={() => setEditing(blank())}>
              پرسش جدید
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")} count={state.faqs.length}>
            همه دسته‌ها
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category}
              active={filter === category}
              onClick={() => setFilter(category)}
              count={state.faqs.filter((faq) => faq.category === category).length}
            >
              {category}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon="chat" title="پرسشی در این دسته ثبت نشده" action={<Button size="sm" icon="plus" onClick={() => setEditing(blank())}>افزودن پرسش</Button>} />
        ) : (
          <div className="space-y-3">
            {rows.map((faq) => (
              <Card key={faq.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-ink-900 dark:text-white">{faq.question}</h3>
                      {faq.pinned && (
                        <Badge tone="gold" size="sm" icon="star">
                          سنجاق‌شده
                        </Badge>
                      )}
                      <Badge tone={faq.published ? "emerald" : "slate"} size="sm" dot>
                        {faq.published ? "منتشرشده" : "پیش‌نویس"}
                      </Badge>
                      <Badge tone="info" size="sm">
                        {faq.category}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">{truncateText(stripMarkdown(faq.answer), 180)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.66rem] font-bold text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="eye" size={13} />
                        {faNumber(faq.views)} بازدید
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="heart" size={13} />
                        {faNumber(faq.helpful)} مفید
                      </span>
                      <span>آخرین ویرایش: {timeAgo(faq.updatedAt)}</span>
                      {faq.serviceSlug && <span className="numeric">خدمت: {faq.serviceSlug}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip content={faq.published ? "لغو انتشار" : "انتشار"}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={faq.published ? "eyeOff" : "eye"}
                        onClick={() => {
                          saveFaq({ ...faq, published: !faq.published, updatedAt: new Date().toISOString() });
                          toast.info(faq.published ? "پرسش از حالت انتشار خارج شد" : "پرسش منتشر شد");
                        }}
                      >
                        {faq.published ? "لغو انتشار" : "انتشار"}
                      </Button>
                    </Tooltip>
                    <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(faq)}>
                      ویرایش
                    </Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setRemoving(faq)}>
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.question ? "ویرایش پرسش" : "پرسش جدید"} size="lg">
        {editing && (
          <div className="space-y-4">
            <Input label="پرسش" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            <Textarea
              label="پاسخ"
              rows={6}
              value={editing.answer}
              onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
              help="می‌توانید از Markdown سبک (فهرست و پررنگ) استفاده کنید."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="دسته‌بندی"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                help={`دسته‌بندی‌های موجود: ${categories.join("، ")}`}
              />
              <Select
                label="خدمت مرتبط"
                value={editing.serviceSlug ?? ""}
                onChange={(e) => setEditing({ ...editing, serviceSlug: e.target.value || null })}
                options={[{ value: "", label: "عمومی (بدون خدمت)" }, ...state.services.map((s) => ({ value: s.slug, label: s.title }))]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Switch checked={editing.published} onChange={(checked) => setEditing({ ...editing, published: checked })} label="منتشر شود" />
              <Switch checked={editing.pinned} onChange={(checked) => setEditing({ ...editing, pinned: checked })} label="سنجاق در بالای فهرست" />
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                icon="save"
                disabled={editing.question.trim().length < 5 || editing.answer.trim().length < 10}
                onClick={() => {
                  saveFaq({ ...editing, updatedAt: new Date().toISOString() });
                  toast.success("پرسش ذخیره شد");
                  setEditing(null);
                }}
              >
                ذخیره
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                انصراف
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            deleteFaq(removing.id);
            toast.warning("پرسش حذف شد");
          }
        }}
        title="حذف پرسش؟"
        description="این پرسش از سایت و نتایج جست‌وجو حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * مقالات
 * ------------------------------------------------------------------ */

export function ArticlesManager() {
  const { state, can, saveArticle, deleteArticle, toast } = useStore();
  const [editing, setEditing] = useState<ArticleRecord | null>(null);
  const [removing, setRemoving] = useState<ArticleRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.articles
      .filter((article) => (statusFilter === "all" ? true : article.status === statusFilter))
      .filter((article) => (q ? `${article.title} ${article.excerpt} ${article.tags.join(" ")}`.toLowerCase().includes(q) : true))
      .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
  }, [state.articles, statusFilter, query]);

  if (!can("content.manage")) return <PermissionNotice permission="content.manage" />;

  const blank = (): ArticleRecord => ({
    id: `art-${Date.now().toString(36)}`,
    slug: `article-${Date.now().toString(36)}`,
    title: "",
    excerpt: "",
    body: "",
    category: "راهنما",
    cover: "/images/articles/health-card.webp",
    author: "کارشناس دفتر",
    status: "draft",
    relatedServices: [],
    tags: [],
    readMinutes: 4,
    views: 0,
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  });

  return (
    <div>
      <AdminPageHeader
        title="مقالات و راهنماها"
        description="محتواهای آموزشی را بنویسید، بازبینی و منتشر کنید. متن‌ها در بخش مقالات سایت و نتایج جست‌وجو نمایش داده می‌شوند."
        icon="book"
        actions={
          <>
            <ButtonLink href="/articles" size="sm" variant="outline" icon="external" external>
              مشاهده در سایت
            </ButtonLink>
            <Button size="sm" icon="plus" onClick={() => setEditing(blank())}>
              مقاله جدید
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <Input label="جست‌وجو" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="عنوان، خلاصه یا برچسب" icon="search" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "همه" },
              { id: "published", label: "منتشرشده" },
              { id: "review", label: "در بازبینی" },
              { id: "draft", label: "پیش‌نویس" },
            ].map((option) => (
              <Chip
                key={option.id}
                active={statusFilter === option.id}
                onClick={() => setStatusFilter(option.id)}
                count={option.id === "all" ? state.articles.length : state.articles.filter((a) => a.status === option.id).length}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <TableShell>
          <table className="w-full min-w-[56rem] text-[0.78rem]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/60 text-[0.66rem] font-black text-ink-500 dark:text-ink-400">
                <th className="p-3 text-start">عنوان</th>
                <th className="p-3 text-start">دسته</th>
                <th className="p-3 text-start">وضعیت</th>
                <th className="p-3 text-start">نویسنده</th>
                <th className="p-3 text-start">زمان مطالعه</th>
                <th className="p-3 text-start">بازدید</th>
                <th className="p-3 text-start">تاریخ</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((article) => (
                <tr key={article.id} className="border-b border-[var(--border-soft)] last:border-0 transition hover:bg-brand-50/40 dark:hover:bg-brand-500/5">
                  <td className="max-w-sm p-3">
                    <p className="truncate font-black text-ink-900 dark:text-white">{article.title}</p>
                    <p className="mt-0.5 truncate text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">{article.excerpt}</p>
                  </td>
                  <td className="p-3">
                    <Badge tone="info" size="sm">
                      {article.category}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge tone={article.status === "published" ? "emerald" : article.status === "review" ? "amber" : "slate"} size="sm" dot>
                      {article.status === "published" ? "منتشرشده" : article.status === "review" ? "در بازبینی" : "پیش‌نویس"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={article.author} size="sm" />
                      <span className="font-bold text-ink-600 dark:text-ink-300">{article.author}</span>
                    </div>
                  </td>
                  <td className="numeric p-3 font-bold text-ink-600 dark:text-ink-300">{faNumber(article.readMinutes)} دقیقه</td>
                  <td className="numeric p-3 font-bold text-ink-600 dark:text-ink-300">{faNumber(article.views)}</td>
                  <td className="p-3 font-bold text-ink-600 dark:text-ink-300">
                    {article.publishedAt ? formatDate(article.publishedAt, "short") : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-500 transition hover:text-brand-700"
                        aria-label="مشاهده در سایت"
                      >
                        <Icon name="external" size={15} />
                      </Link>
                      <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(article)}>
                        ویرایش
                      </Button>
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => setRemoving(article)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.title ? "ویرایش مقاله" : "مقاله جدید"} size="xl">
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="عنوان" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Input label="نشانی (slug)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} dir="ltr" className="text-start" />
            </div>
            <Textarea label="خلاصه" rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            <Textarea
              label="متن مقاله (Markdown)"
              rows={12}
              value={editing.body}
              onChange={(e) => {
                const value = e.target.value;
                setEditing({ ...editing, body: value, readMinutes: Math.max(1, readingTime(value).minutes) });
              }}
              help={`تخمین زمان مطالعه: ${faNumber(editing.readMinutes)} دقیقه — ${faNumber(readingTime(editing.body).words)} واژه`}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="دسته‌بندی" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <Input label="نویسنده" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
              <Select
                label="وضعیت"
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as ArticleRecord["status"] })}
                options={[
                  { value: "draft", label: "پیش‌نویس" },
                  { value: "review", label: "در بازبینی" },
                  { value: "published", label: "منتشرشده" },
                ]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="برچسب‌ها (با کاما)"
                value={editing.tags.join("، ")}
                onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(/[،,]/).map((t) => t.trim()).filter(Boolean) })}
              />
              <Select
                label="خدمت مرتبط"
                value={editing.relatedServices[0] ?? ""}
                onChange={(e) => setEditing({ ...editing, relatedServices: e.target.value ? [e.target.value] : [] })}
                options={[{ value: "", label: "بدون خدمت مرتبط" }, ...state.services.map((s) => ({ value: s.slug, label: s.title }))]}
              />
            </div>
            <Alert tone="info" icon="info">
              در حالت «منتشرشده»، تاریخ انتشار به‌صورت خودکار ثبت می‌شود و مقاله در سایت و نقشه سایت دیده خواهد شد.
            </Alert>
            <div className="flex items-center gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                icon="save"
                disabled={editing.title.trim().length < 5 || editing.body.trim().length < 30}
                onClick={() => {
                  saveArticle({
                    ...editing,
                    publishedAt: editing.status === "published" ? (editing.publishedAt ?? new Date().toISOString()) : null,
                    updatedAt: new Date().toISOString(),
                  });
                  toast.success("مقاله ذخیره شد");
                  setEditing(null);
                }}
              >
                ذخیره مقاله
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                انصراف
              </Button>
              <span className="ms-auto text-[0.68rem] font-bold text-ink-400">
                برای ویرایش متن بلند، می‌توانید آن را از فایل Markdown کپی کنید. <Kbd>Ctrl</Kbd>+<Kbd>S</Kbd> نیز ذخیره می‌کند.
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            deleteArticle(removing.id);
            toast.warning("مقاله حذف شد");
          }
        }}
        title="حذف مقاله؟"
        description="این مقاله از بخش مقالات سایت و نقشه سایت حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * اطلاعیه‌ها
 * ------------------------------------------------------------------ */

export function AnnouncementsManager() {
  const { state, can, saveAnnouncement, deleteAnnouncement, toast } = useStore();
  const [draft, setDraft] = useState<AnnouncementRecord | null>(null);

  if (!can("content.manage")) return <PermissionNotice permission="content.manage" />;

  const blank = (): AnnouncementRecord => ({
    id: `ann-${Date.now().toString(36)}`,
    title: "",
    body: "",
    level: "info",
    active: true,
    startsAt: new Date().toISOString(),
    endsAt: null,
    createdAt: new Date().toISOString(),
  });

  return (
    <div>
      <AdminPageHeader
        title="اطلاعیه‌ها"
        description="پیام‌های کوتاه برای مراجعان و کارکنان؛ اطلاعیه فعال در نوار بالای سایت و پیشخوان نمایش داده می‌شود."
        icon="bell"
        actions={
          <Button size="sm" icon="plus" onClick={() => setDraft(blank())}>
            اطلاعیه جدید
          </Button>
        }
      />

      {state.announcements.length === 0 ? (
        <EmptyState
          icon="bell"
          title="اطلاعیه‌ای ثبت نشده است"
          description="برای اطلاع‌رسانی تعطیلی، تغییر ساعت کاری یا رویدادهای خاص، اطلاعیه بسازید."
          action={<Button size="sm" icon="plus" onClick={() => setDraft(blank())}>افزودن اطلاعیه</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.announcements.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-ink-900 dark:text-white">{item.title}</h3>
                    <Badge
                      tone={item.level === "danger" ? "rose" : item.level === "warning" ? "amber" : item.level === "success" ? "emerald" : "info"}
                      size="sm"
                      dot
                    >
                      {item.level === "danger" ? "هشدار" : item.level === "warning" ? "توجه" : item.level === "success" ? "خبر خوب" : "اطلاع"}
                    </Badge>
                    <Badge tone={item.active ? "emerald" : "slate"} size="sm">
                      {item.active ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[0.78rem] leading-7 text-ink-600 dark:text-ink-300">{item.body}</p>
                  <p className="mt-2 text-[0.66rem] font-bold text-ink-400">
                    شروع: {formatDate(item.startsAt, "medium")}
                    {item.endsAt ? ` • پایان: ${formatDate(item.endsAt, "medium")}` : " • بدون تاریخ پایان"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={item.active}
                    onChange={(checked) => {
                      saveAnnouncement({ ...item, active: checked });
                      toast.info(checked ? "اطلاعیه فعال شد" : "اطلاعیه غیرفعال شد");
                    }}
                    label=""
                  />
                  <Button size="sm" variant="outline" icon="edit" onClick={() => setDraft(item)}>
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="trash"
                    onClick={() => {
                      deleteAnnouncement(item.id);
                      toast.warning("اطلاعیه حذف شد");
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.title ? "ویرایش اطلاعیه" : "اطلاعیه جدید"}>
        {draft && (
          <div className="space-y-4">
            <Input label="عنوان" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <Textarea label="متن اطلاعیه" rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="سطح اهمیت"
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value as AnnouncementRecord["level"] })}
                options={[
                  { value: "info", label: "اطلاع‌رسانی" },
                  { value: "success", label: "خبر خوب" },
                  { value: "warning", label: "توجه" },
                  { value: "danger", label: "هشدار" },
                ]}
              />
              <Input
                label="تاریخ پایان (اختیاری)"
                type="date"
                value={draft.endsAt ? draft.endsAt.slice(0, 10) : ""}
                onChange={(e) => setDraft({ ...draft, endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
            <Switch checked={draft.active} onChange={(checked) => setDraft({ ...draft, active: checked })} label="نمایش فعال" />
            <div className="flex items-center gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                icon="save"
                disabled={draft.title.trim().length < 3 || draft.body.trim().length < 10}
                onClick={() => {
                  saveAnnouncement(draft);
                  toast.success("اطلاعیه ذخیره شد");
                  setDraft(null);
                }}
              >
                ذخیره
              </Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                انصراف
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
