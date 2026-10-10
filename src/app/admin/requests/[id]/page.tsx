import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { roleHasPermission, REQUEST_STATUSES, REQUEST_STATUS_KEYS, CONTACT_PREFERENCES, REQUESTER_TYPES, type RequestStatus } from "@/lib/constants";
import { getRequestById, getRequestFields, getRequestAttachments, getRequestHistory, requestNotes, requestNotifications } from "@/lib/queries";
import { PageHeader, Card, StatusBadge, EmptyState, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Field, inputClass } from "@/components/field";
import { Icon } from "@/components/icons";
import { formatBytes, formatFaDate, toFaDigits, maskPhone } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/session";
import { updateStatusAction, addInternalNoteAction, toggleArchiveAction, deleteRequestAction, deleteAttachmentAction, replaceAttachmentAction } from "@/app/admin/_actions/requests";

export const metadata = { title: "جزئیات درخواست" };

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; err?: string }>;
}) {
  await requirePermission("requests.view");
  const user = await getSessionUser();
  const { id } = await params;
  const sp = await searchParams;
  const r = await getRequestById(id);
  if (!r) notFound();

  const canManage = user ? roleHasPermission(user.role, "requests.manage") : false;
  const canViewFiles = user ? roleHasPermission(user.role, "attachments.view") : false;
  const canManageFiles = user ? roleHasPermission(user.role, "attachments.manage") : false;
  const isOwner = user?.role === "owner";

  const [fields, attachments, history, notes, notifications] = await Promise.all([
    getRequestFields(id),
    getRequestAttachments(id),
    getRequestHistory(id),
    requestNotes(id),
    requestNotifications(id),
  ]);
  const canNotifyApplicant = r.preferred_contact === "email" && Boolean(r.email);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`درخواست ${r.tracking_code}`}
        desc={`${r.service_title} · ثبت: ${formatFaDate(r.created_at)}`}
        actions={<Link href="/admin/requests" className={btn.ghost}>بازگشت به فهرست</Link>}
      />
      <Flash msg={sp.msg} err={sp.err} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card title="اطلاعات متقاضی">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">وضعیت</dt><dd className="mt-1"><StatusBadge status={r.status} /></dd></div>
              <div><dt className="text-slate-500">نوع متقاضی</dt><dd className="font-bold">{REQUESTER_TYPES[r.requester_type as keyof typeof REQUESTER_TYPES] ?? r.requester_type}</dd></div>
              <div><dt className="text-slate-500">نام و نام خانوادگی</dt><dd className="font-bold">{r.full_name}</dd></div>
              <div><dt className="text-slate-500">شماره تماس</dt><dd className="ltr-num font-bold" dir="ltr">{r.phone}</dd></div>
              <div><dt className="text-slate-500">ایمیل</dt><dd className="font-bold" dir="ltr">{r.email || "—"}</dd></div>
              <div><dt className="text-slate-500">روش ارتباطی ترجیحی</dt><dd className="font-bold">{CONTACT_PREFERENCES[r.preferred_contact as keyof typeof CONTACT_PREFERENCES] ?? r.preferred_contact}</dd></div>
              <div><dt className="text-slate-500">واحد / مجموعه</dt><dd className="font-bold">{r.org_name || "—"}</dd></div>
              <div><dt className="text-slate-500">شهر</dt><dd className="font-bold">{r.city || "—"}</dd></div>
              <div><dt className="text-slate-500">تأیید حریم خصوصی</dt><dd className="font-bold">{formatFaDate(r.consent_privacy_at)}</dd></div>
              <div><dt className="text-slate-500">رضایت پیام‌های عمومی</dt><dd className="font-bold">{r.consent_marketing ? "دارد" : "ندارد"}</dd></div>
            </dl>
            {r.message && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7">
                <p className="mb-1 font-bold text-slate-600">توضیحات متقاضی</p>
                <p className="whitespace-pre-line">{r.message}</p>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">نمایش عمومی شماره در پیگیری: {maskPhone(r.phone)}</p>
          </Card>

          <Card title="اطلاعات اختصاصی خدمت">
            {fields.length === 0 ? (
              <EmptyState>اطلاعات اختصاصی ثبت نشده است.</EmptyState>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.field_key}>
                    <dt className="text-sm text-slate-500">{f.label}</dt>
                    <dd className="whitespace-pre-line font-bold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card title="مدارک">
            {attachments.length === 0 ? (
              <EmptyState>مدرکی بارگذاری نشده است.</EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100">
                {attachments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className={`font-bold ${a.deleted_at ? "text-slate-400 line-through" : ""}`}>{a.original_name}</p>
                      <p className="text-xs text-slate-500">
                        {a.mime_type} · {formatBytes(a.size_bytes)} · {formatFaDate(a.uploaded_at)}
                        {a.deleted_at ? ` · حذف‌شده (${formatFaDate(a.deleted_at)})` : ""}
                      </p>
                    </div>
                    {!a.deleted_at && (
                      <div className="flex flex-wrap items-center gap-2">
                        {canViewFiles && (
                          <a href={`/admin/attachments/${a.id}`} className={btn.ghost}>
                            <Icon name="upload" size={16} /> دانلود
                          </a>
                        )}
                        {canManageFiles && (
                          <>
                            <form action={replaceAttachmentAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
                              <input type="hidden" name="attachmentId" value={a.id} />
                              <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required aria-label="فایل جایگزین" className="max-w-[12rem] text-xs" />
                              <button type="submit" className={btn.ghost}>جایگزینی</button>
                            </form>
                            <ConfirmForm action={deleteAttachmentAction} message="فایل حذف شود؟ این عملیات قابل بازگشت نیست.">
                              <input type="hidden" name="attachmentId" value={a.id} />
                              <button type="submit" className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50">حذف</button>
                            </ConfirmForm>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-slate-500">هر دانلود یا تغییر مدرک در سابقه دسترسی ثبت می‌شود.</p>
          </Card>
        </div>

        <div className="space-y-6">
          {canManage && (
            <Card title="تغییر وضعیت">
              <form action={updateStatusAction} className="space-y-4">
                <input type="hidden" name="requestId" value={r.id} />
                <Field label="وضعیت جدید" name="status" required>
                  <select id="status" name="status" defaultValue={r.status} required className={inputClass}>
                    {REQUEST_STATUS_KEYS.map((k) => (
                      <option key={k} value={k}>{REQUEST_STATUSES[k as RequestStatus].label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="توضیح قابل‌مشاهده برای متقاضی" name="publicNote" hint="این متن در صفحه پیگیری نمایش داده می‌شود. برای «نیازمند تکمیل اطلاعات» و «ردشده» الزامی است. یادداشت داخلی را اینجا ننویسید.">
                  <textarea id="publicNote" name="publicNote" rows={3} maxLength={1500} defaultValue={r.public_note} className={inputClass} />
                </Field>
                <label className="flex items-start gap-2 text-sm leading-6">
                  <input type="checkbox" name="notifyApplicant" className="mt-1 h-4 w-4 accent-brand-700" disabled={!canNotifyApplicant} defaultChecked={canNotifyApplicant} />
                  <span>
                    ارسال اعلان ایمیلی به متقاضی
                    {!canNotifyApplicant && <span className="block text-xs text-slate-500">فقط برای متقاضیانی که «ایمیل» را روش ارتباطی انتخاب کرده‌اند و ایمیل دارند.</span>}
                  </span>
                </label>
                <Field label="یادداشت داخلی (اختیاری)" name="internalNote" hint="فقط برای کارکنان مجاز نمایش داده می‌شود.">
                  <textarea id="internalNote" name="internalNote" rows={2} maxLength={2000} className={inputClass} />
                </Field>
                <button type="submit" className={btn.primary}>ذخیره وضعیت</button>
              </form>
            </Card>
          )}

          {canManage && (
            <Card title="یادداشت‌های داخلی">
              <form action={addInternalNoteAction} className="space-y-3">
                <input type="hidden" name="requestId" value={r.id} />
                <textarea name="body" required rows={2} maxLength={2000} aria-label="متن یادداشت داخلی" className={inputClass} placeholder="یادداشت فقط برای کارکنان است…" />
                <button type="submit" className={btn.ghost}>افزودن یادداشت</button>
              </form>
              <ul className="mt-4 space-y-3">
                {notes.length === 0 && <EmptyState>یادداشتی ثبت نشده است.</EmptyState>}
                {notes.map((n) => (
                  <li key={n.id} className="rounded-2xl bg-amber-50/60 p-3 text-sm leading-7">
                    <p className="whitespace-pre-line">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-500">{n.author_name} · {formatFaDate(n.created_at)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="سابقه وضعیت (قابل‌مشاهده برای متقاضی)">
            <ol className="space-y-3 border-r-2 border-brand-100 pr-4">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="font-bold">{REQUEST_STATUSES[h.to_status as RequestStatus]?.label ?? h.to_status}</p>
                  <p className="text-xs text-slate-500">{h.actor_name || "سامانه"} · {formatFaDate(h.created_at)}</p>
                  {h.note && <p className="mt-1 text-slate-700">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Card>

          <Card title="اعلان‌ها">
            {notifications.length === 0 ? (
              <EmptyState>اعلانی برای این درخواست ثبت نشده است.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {notifications.map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
                    <span>{n.kind === "admin_new_request" ? "اعلان مدیر" : n.kind === "applicant_confirmation" ? "تأیید به متقاضی" : "وضعیت"} · {n.channel}</span>
                    <span className="font-bold">{n.status === "sent" ? "ارسال‌شده" : n.status === "failed" ? "ناموفق" : n.status === "skipped" ? "پیکربندی‌نشده" : "در صف"}</span>
                    {n.last_error && <span className="w-full text-xs text-rose-700">{n.last_error}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {isOwner && (
            <Card title="عملیات مدیر کل">
              <div className="space-y-3">
                <ConfirmForm action={toggleArchiveAction} message={r.archived ? "از بایگانی خارج شود؟" : "این درخواست بایگانی شود؟"}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <button type="submit" className={btn.ghost}>{r.archived ? "خروج از بایگانی" : "بایگانی درخواست"}</button>
                </ConfirmForm>
                <ConfirmForm action={deleteRequestAction} message="درخواست و تمام مدارک آن برای همیشه حذف شود؟ این عملیات قابل بازگشت نیست.">
                  <input type="hidden" name="requestId" value={r.id} />
                  <button type="submit" className={btn.danger}>حذف دائمی طبق سیاست نگهداری</button>
                </ConfirmForm>
                <p className="text-xs leading-6 text-slate-500">حذف دائمی، مدارک و اعلان‌های این درخواست را پاک می‌کند. سابقه رویداد بدون اطلاعات شخصی باقی می‌ماند.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
      {!canManage && <p className="text-sm text-slate-500">شما فقط مجوز مشاهده دارید.</p>}
    </div>
  );
}
