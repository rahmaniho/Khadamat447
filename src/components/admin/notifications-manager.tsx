"use client";

/**
 * صف اعلان‌ها
 * ---------------------------------------------------------------
 * پیام‌های ایمیلی، پیامکی و تلگرامی؛ مشاهده متن، تلاش مجدد،
 * ارسال آزمایشی و پایش وضعیت ارسال.
 */
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, Button, ButtonLink, Card, Chip, EmptyState, Metric, Progress } from "@/components/ui/primitives";
import { Modal, Tooltip } from "@/components/ui/overlay";
import { Input, Select } from "@/components/ui/form";
import { AdminPageHeader, PermissionNotice, Pagination, TableShell } from "@/components/admin/shell";
import { useStore } from "@/lib/store/store";
import { CHANNEL_META, type NotificationRecord } from "@/lib/store/types";
import { fa, faNumber, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 12;

const STATUS_META_LOCAL: Record<NotificationRecord["status"], { label: string; tone: string }> = {
  queued: { label: "در صف ارسال", tone: "amber" },
  sent: { label: "ارسال شده", tone: "emerald" },
  failed: { label: "ناموفق", tone: "rose" },
  opened: { label: "باز شده توسط مراجع", tone: "info" },
};

export function NotificationsManager() {
  const { state, can, retryNotification, sendTestNotification, toast } = useStore();
  const [status, setStatus] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<NotificationRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.notifications
      .filter((item) => (status === "all" ? true : item.status === status))
      .filter((item) => (channel === "all" ? true : item.channel === channel))
      .filter((item) => (q ? `${item.subject} ${item.recipient} ${item.body} ${item.trackingCode ?? ""}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.notifications, status, channel, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      queued: state.notifications.filter((n) => n.status === "queued").length,
      sent: state.notifications.filter((n) => n.status === "sent").length,
      failed: state.notifications.filter((n) => n.status === "failed").length,
      opened: state.notifications.filter((n) => n.status === "opened").length,
    }),
    [state.notifications],
  );

  if (!can("notifications.manage")) return <PermissionNotice permission="notifications.manage" />;

  const successRate = state.notifications.length ? Math.round((counts.sent / state.notifications.length) * 100) : 0;

  return (
    <div>
      <AdminPageHeader
        title="صف اعلان‌ها"
        description="همه پیام‌های اطلاع‌رسانی سامانه؛ می‌توانید متن را ببینید، موارد ناموفق را دوباره ارسال کنید و ارسال آزمایشی بگیرید."
        icon="send"
        actions={
          <>
            {(["email", "sms", "telegram"] as const).map((ch) => (
              <Button
                key={ch}
                size="sm"
                variant="outline"
                icon={CHANNEL_META[ch].icon}
                onClick={() => {
                  sendTestNotification(ch);
                  toast.success(`ارسال آزمایشی ${CHANNEL_META[ch].label}`, "پیام در صف ارسال قرار گرفت.");
                }}
              >
                ارسال آزمایشی {CHANNEL_META[ch].label}
              </Button>
            ))}
            <ButtonLink href="/admin/settings" size="sm" variant="ghost" icon="gear">
              تنظیمات اعلان‌ها
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="در صف ارسال" value={faNumber(counts.queued)} icon="clock" tone="gold" />
        <Metric label="ارسال‌شده" value={faNumber(counts.sent)} icon="checkCircle" tone="success" />
        <Metric label="ناموفق" value={faNumber(counts.failed)} icon="alertCircle" tone="danger" />
        <Metric label="بازشده توسط مراجع" value={faNumber(counts.opened)} icon="eye" tone="info" />
      </div>

      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-ink-900 dark:text-white">نرخ موفقیت ارسال</h2>
            <p className="mt-1 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
              نسبت پیام‌های ارسال‌شده به کل پیام‌ها: {fa(successRate)}٪
            </p>
          </div>
          <div className="min-w-56">
            <Progress value={successRate} tone={successRate > 80 ? "success" : successRate > 50 ? "gold" : "danger"} showLabel />
          </div>
          {counts.failed > 0 && (
            <Button
              size="sm"
              variant="outline"
              icon="refresh"
              onClick={() => {
                state.notifications.filter((n) => n.status === "failed").forEach((n) => retryNotification(n.id));
                toast.info("همه موارد ناموفق دوباره در صف قرار گرفتند");
              }}
            >
              تلاش مجدد همه ناموفق‌ها
            </Button>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          <Input
            label="جست‌وجو"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="موضوع، گیرنده یا کد پیگیری"
            icon="search"
          />
          <Select
            label="کانال"
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            options={[{ value: "all", label: "همه کانال‌ها" }, ...Object.entries(CHANNEL_META).map(([key, value]) => ({ value: key, label: value.label }))]}
          />
          <Select
            label="وضعیت"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "همه وضعیت‌ها" },
              ...Object.entries(STATUS_META_LOCAL).map(([key, value]) => ({ value: key, label: value.label })),
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip active={status === "all"} onClick={() => { setStatus("all"); setPage(1); }} count={state.notifications.length}>
            همه
          </Chip>
          {(Object.keys(STATUS_META_LOCAL) as Array<NotificationRecord["status"]>).map((key) => (
            <Chip key={key} active={status === key} onClick={() => { setStatus(key); setPage(1); }} count={state.notifications.filter((n) => n.status === key).length}>
              {STATUS_META_LOCAL[key].label}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon="send" title="اعلانی با این فیلترها نیست" description="فیلترها را تغییر دهید یا ارسال آزمایشی بگیرید." />
        ) : (
          <TableShell>
            <table className="w-full min-w-[56rem] text-[0.78rem]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/60 text-[0.66rem] font-black text-ink-500 dark:text-ink-400">
                  <th className="p-3 text-start">کانال</th>
                  <th className="p-3 text-start">گیرنده</th>
                  <th className="p-3 text-start">موضوع</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">تلاش</th>
                  <th className="p-3 text-start">زمان</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border-soft)] last:border-0 transition hover:bg-brand-50/40 dark:hover:bg-brand-500/5">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2 font-bold text-ink-700 dark:text-ink-200">
                        <Icon name={CHANNEL_META[item.channel].icon} size={15} className="text-brand-600 dark:text-brand-400" />
                        {CHANNEL_META[item.channel].label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="numeric font-bold text-ink-700 dark:text-ink-200" dir="ltr">
                        {item.recipient}
                      </span>
                      {item.trackingCode && (
                        <span className="mt-0.5 block text-[0.64rem] font-bold text-ink-400" dir="ltr">
                          {item.trackingCode}
                        </span>
                      )}
                    </td>
                    <td className="max-w-sm p-3">
                      <button type="button" onClick={() => setPreview(item)} className="block max-w-full truncate text-start font-black text-ink-900 hover:text-brand-700 dark:text-white">
                        {item.subject}
                      </button>
                      <span className="mt-0.5 block truncate text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">{item.body}</span>
                    </td>
                    <td className="p-3">
                      <Badge tone={STATUS_META_LOCAL[item.status].tone} size="sm" dot>
                        {STATUS_META_LOCAL[item.status].label}
                      </Badge>
                      {item.error && <p className="mt-1 text-[0.62rem] font-bold text-rose-500">{item.error}</p>}
                    </td>
                    <td className="numeric p-3 font-bold text-ink-600 dark:text-ink-300">{faNumber(item.attempts)}</td>
                    <td className="p-3">
                      <span className="font-bold text-ink-600 dark:text-ink-300">{timeAgo(item.createdAt)}</span>
                      <span className="mt-0.5 block text-[0.62rem] font-bold text-ink-400">{formatDate(item.createdAt, "datetime")}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip content="مشاهده متن کامل">
                          <Button size="sm" variant="ghost" icon="eye" onClick={() => setPreview(item)}>
                            متن
                          </Button>
                        </Tooltip>
                        {(item.status === "failed" || item.status === "queued") && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon="refresh"
                            onClick={() => {
                              retryNotification(item.id);
                              toast.info("در صف ارسال مجدد قرار گرفت");
                            }}
                          >
                            تلاش مجدد
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="متن اعلان" size="lg">
        {preview && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={CHANNEL_META[preview.channel].tone} icon={CHANNEL_META[preview.channel].icon}>
                {CHANNEL_META[preview.channel].label}
              </Badge>
              <Badge tone={STATUS_META_LOCAL[preview.status].tone} dot>
                {STATUS_META_LOCAL[preview.status].label}
              </Badge>
              <Badge tone="slate" size="sm">
                {formatDate(preview.createdAt, "datetime")}
              </Badge>
            </div>
            <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-4">
              <p className="text-[0.68rem] font-black text-ink-500 dark:text-ink-400">گیرنده</p>
              <p className="numeric mt-1 text-[0.82rem] font-black text-ink-900 dark:text-white" dir="ltr">
                {preview.recipient}
              </p>
              <p className="mt-3 text-[0.68rem] font-black text-ink-500 dark:text-ink-400">موضوع</p>
              <p className="mt-1 text-[0.82rem] font-black text-ink-900 dark:text-white">{preview.subject}</p>
              <p className="mt-3 whitespace-pre-line text-[0.8rem] leading-8 text-ink-700 dark:text-ink-200">{preview.body}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                icon="copy"
                onClick={() => {
                  navigator.clipboard?.writeText(`${preview.subject}\n\n${preview.body}`);
                  toast.success("متن کپی شد");
                }}
              >
                کپی متن
              </Button>
              {(preview.status === "failed" || preview.status === "queued") && (
                <Button
                  size="sm"
                  variant="outline"
                  icon="refresh"
                  onClick={() => {
                    retryNotification(preview.id);
                    setPreview(null);
                    toast.info("در صف ارسال مجدد قرار گرفت");
                  }}
                >
                  تلاش مجدد
                </Button>
              )}
              {preview.requestId && (
                <ButtonLink
                  size="sm"
                  variant="ghost"
                  icon="external"
                  href={`/admin/requests/view?code=${preview.trackingCode ?? ""}`}
                >
                  مشاهده پرونده
                </ButtonLink>
              )}
              <span className={cn("ms-auto text-[0.66rem] font-bold text-ink-400")}>
                تلاش‌ها: {faNumber(preview.attempts)}
                {preview.sentAt ? ` • ارسال: ${formatDate(preview.sentAt, "datetime")}` : ""}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
