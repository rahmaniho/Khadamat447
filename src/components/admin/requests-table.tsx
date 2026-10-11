"use client";

/**
 * کارتابل درخواست‌ها
 * ---------------------------------------------------------------
 * جدول کامل با فیلتر وضعیت/خدمت/اولویت/کارشناس، جست‌وجو، مرتب‌سازی،
 * انتخاب گروهی، اقدام‌های گروهی و خروجی CSV.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { Alert, Avatar, Badge, Button, ButtonLink, Card, Chip, EmptyState, Kbd, Metric, Progress } from "@/components/ui/primitives";
import { Tooltip } from "@/components/ui/overlay";
import { Input, Select } from "@/components/ui/form";
import { Pagination, PermissionNotice, TableShell } from "@/components/admin/shell";
import { useStore } from "@/lib/store/store";
import {
  PRIORITY_META,
  STATUS_META,
  type Priority,
  type RequestRecord,
  type RequestStatus,
} from "@/lib/store/types";
import { fa, faNumber, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;

const STATUS_ORDER: RequestStatus[] = [
  "new",
  "pending_review",
  "needs_info",
  "in_review",
  "ready_to_report",
  "completed",
  "rejected",
];

export function RequestsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, can, updateRequest, deleteRequest, saveUser, toast } = useStore();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(searchParams.get("status") ?? "all");
  const [service, setService] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "due" | "priority">("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<RequestStatus | "">("");
  const [bulkAssignee, setBulkAssignee] = useState("");

  const reviewers = useMemo(() => state.users.filter((user) => user.role === "reviewer" || user.role === "owner"), [state.users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = state.requests.filter((request) => {
      if (status !== "all" && request.status !== status) return false;
      if (service !== "all" && request.serviceSlug !== service) return false;
      if (priority !== "all" && request.priority !== priority) return false;
      if (assignee !== "all" && (request.assignee || "none") !== assignee) return false;
      if (q) {
        const haystack = [
          request.trackingCode,
          request.fullName,
          request.phone,
          request.serviceTitle,
          request.summary,
          request.organization,
          request.city,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "due") return a.dueAt.localeCompare(b.dueAt);
      const order: Priority[] = ["urgent", "high", "normal", "low"];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

    return rows;
  }, [state.requests, query, status, service, priority, assignee, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = current.length > 0 && current.every((row) => selected.includes(row.id));

  const stats = useMemo(() => {
    const count = (s: RequestStatus) => state.requests.filter((r) => r.status === s).length;
    return {
      urgent: state.requests.filter((r) => r.priority === "urgent" && r.status !== "completed" && r.status !== "rejected").length,
      overdue: state.requests.filter((r) => new Date(r.dueAt).getTime() < Date.now() && r.status !== "completed" && r.status !== "rejected").length,
      unassigned: state.requests.filter((r) => !r.assignee && r.status !== "completed" && r.status !== "rejected").length,
      needsInfo: count("needs_info"),
    };
  }, [state.requests]);

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setService("all");
    setPriority("all");
    setAssignee("all");
    setSort("newest");
    setPage(1);
    router.replace("/admin/requests");
  };

  const applyBulkStatus = () => {
    if (!bulkStatus) return;
    const label = STATUS_META[bulkStatus].label;
    selected.forEach((id) => updateRequest(id, { status: bulkStatus, updatedAt: new Date().toISOString() }));
    toast.success(`${faNumber(selected.length)} درخواست به «${label}» تغییر یافت`);
    setSelected([]);
    setBulkStatus("");
  };

  const applyBulkAssignee = () => {
    if (!bulkAssignee) return;
    const name = bulkAssignee === "none" ? "" : (state.users.find((u) => u.id === bulkAssignee)?.name ?? "");
    selected.forEach((id) => updateRequest(id, { assignee: name, updatedAt: new Date().toISOString() }));
    toast.success(`کارشناس ${name || "حذف"} برای ${faNumber(selected.length)} درخواست ثبت شد`);
    setSelected([]);
    setBulkAssignee("");
  };

  const exportCsv = () => {
    const rows = filtered.length ? filtered : state.requests;
    const header = ["کد پیگیری", "نام متقاضی", "تلفن", "خدمت", "وضعیت", "اولویت", "کارشناس", "تاریخ ثبت", "مهلت"];
    const body = rows.map((request) =>
      [
        request.trackingCode,
        request.fullName,
        request.phone,
        request.serviceTitle,
        STATUS_META[request.status].label,
        PRIORITY_META[request.priority].label,
        request.assignee || "-",
        formatDate(request.createdAt, "datetime"),
        formatDate(request.dueAt, "datetime"),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = `\uFEFF${[header.join(","), ...body].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("خروجی CSV ساخته شد", `${faNumber(rows.length)} ردیف ذخیره شد.`);
  };

  if (!can("requests.view")) return <PermissionNotice permission="requests.view" />;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="در جریان" value={faNumber(state.requests.filter((r) => !["completed", "rejected"].includes(r.status)).length)} icon="activity" tone="info" />
        <Metric label="فوری" value={faNumber(stats.urgent)} icon="zap" tone="danger" />
        <Metric label="عقب‌افتاده از مهلت" value={faNumber(stats.overdue)} icon="clock" tone="gold" />
        <Metric label="بدون کارشناس" value={faNumber(stats.unassigned)} icon="user" />
      </div>

      {(stats.overdue > 0 || stats.needsInfo > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {stats.overdue > 0 && (
            <Alert tone="warning" icon="alert" title={`${faNumber(stats.overdue)} درخواست از مهلت اعلامی گذشته است`}>
              برای حفظ کیفیت پاسخ‌دهی، این موارد را در اولویت بررسی قرار دهید.
            </Alert>
          )}
          {stats.needsInfo > 0 && (
            <Alert tone="info" icon="info" title={`${faNumber(stats.needsInfo)} درخواست در انتظار تکمیل مدارک است`}>
              با ارسال پیام از طریق کانال انتخابی متقاضی، مدارک ناقص را درخواست کنید.
            </Alert>
          )}
        </div>
      )}

      {/* فیلترها */}
      <Card className="mt-5 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <Input
            label="جست‌وجو"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="کد پیگیری، نام، تلفن یا موضوع"
            icon="search"
          />
          <Select
            label="خدمت"
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "همه خدمات" },
              { value: "unset", label: "—" },
              ...state.services.map((item) => ({ value: item.slug, label: item.title })),
            ].filter((o) => o.value !== "unset")}
          />
          <Select
            label="اولویت"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "همه اولویت‌ها" },
              ...(Object.keys(PRIORITY_META) as Priority[]).map((key) => ({ value: key, label: PRIORITY_META[key].label })),
            ]}
          />
          <Select
            label="کارشناس"
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "همه کارشناسان" },
              { value: "none", label: "بدون کارشناس" },
              ...reviewers.map((user) => ({ value: user.name, label: user.name })),
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip active={status === "all"} onClick={() => { setStatus("all"); setPage(1); }} count={state.requests.length}>
            همه
          </Chip>
          {STATUS_ORDER.map((key) => (
            <Chip
              key={key}
              active={status === key}
              onClick={() => {
                setStatus(key);
                setPage(1);
              }}
              count={state.requests.filter((r) => r.status === key).length}
            >
              {STATUS_META[key].label}
            </Chip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              options={[
                { value: "newest", label: "جدیدترین" },
                { value: "oldest", label: "قدیمی‌ترین" },
                { value: "due", label: "نزدیک‌ترین مهلت" },
                { value: "priority", label: "بالاترین اولویت" },
              ]}
            />
            <Button variant="ghost" size="sm" icon="refresh" onClick={resetFilters}>
              پاک کردن فیلترها
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="slate" size="sm">
              {faNumber(filtered.length)} نتیجه
            </Badge>
            <Button variant="outline" size="sm" icon="download" onClick={exportCsv}>
              خروجی CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* نوار اقدام گروهی */}
      {selected.length > 0 && can("requests.manage") && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-3xl border border-brand-200 bg-brand-50/80 p-3.5 dark:border-brand-500/25 dark:bg-brand-500/10">
          <Badge tone="brand" dot>
            {faNumber(selected.length)} درخواست انتخاب شده
          </Badge>
          <div className="flex items-center gap-2">
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as RequestStatus | "")}
              options={[
                { value: "", label: "تغییر وضعیت…" },
                ...STATUS_ORDER.map((key) => ({ value: key, label: STATUS_META[key].label })),
              ]}
            />
            <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus} icon="save">
              اعمال
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              options={[
                { value: "", label: "واگذاری به…" },
                { value: "none", label: "حذف کارشناس" },
                ...reviewers.map((user) => ({ value: user.id, label: user.name })),
              ]}
            />
            <Button size="sm" variant="outline" onClick={applyBulkAssignee} disabled={!bulkAssignee} icon="users">
              واگذاری
            </Button>
          </div>
          {can("requests.delete") && (
            <Button
              size="sm"
              variant="danger"
              icon="trash"
              onClick={() => {
                selected.forEach((id) => deleteRequest(id));
                toast.warning(`${faNumber(selected.length)} درخواست حذف شد`);
                setSelected([]);
              }}
            >
              حذف
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="ms-auto">
            لغو انتخاب
          </Button>
        </div>
      )}

      {/* جدول */}
      <div className="mt-4">
        {current.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="درخواستی با این فیلترها پیدا نشد"
            description="فیلترها را تغییر دهید یا جست‌وجو را پاک کنید."
            action={
              <Button variant="outline" size="sm" icon="refresh" onClick={resetFilters}>
                نمایش همه درخواست‌ها
              </Button>
            }
          />
        ) : (
          <TableShell>
            <table className="w-full min-w-[62rem] text-[0.78rem]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/60 text-[0.66rem] font-black text-ink-500 dark:text-ink-400">
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(allSelected ? selected.filter((id) => !current.some((row) => row.id === id)) : Array.from(new Set([...selected, ...current.map((row) => row.id)])))
                      }
                      className="h-4 w-4 accent-brand-600"
                      aria-label="انتخاب همه"
                    />
                  </th>
                  <th className="p-3 text-start">کد پیگیری</th>
                  <th className="p-3 text-start">متقاضی</th>
                  <th className="p-3 text-start">خدمت</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">اولویت</th>
                  <th className="p-3 text-start">کارشناس</th>
                  <th className="p-3 text-start">مهلت</th>
                  <th className="p-3 text-start">مدارک</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {current.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    selected={selected.includes(request.id)}
                    onToggle={() =>
                      setSelected((prev) => (prev.includes(request.id) ? prev.filter((id) => id !== request.id) : [...prev, request.id]))
                    }
                    reviewers={reviewers}
                    canManage={can("requests.manage")}
                    onAssign={(userId) => {
                      const user = state.users.find((u) => u.id === userId);
                      updateRequest(request.id, { assignee: user ? user.name : "", updatedAt: new Date().toISOString() });
                      if (user) saveUser({ ...user, lastLoginAt: user.lastLoginAt });
                      toast.success(`به ${user?.name ?? "—"} واگذار شد`);
                    }}
                    onPriority={(next) => {
                      updateRequest(request.id, { priority: next, updatedAt: new Date().toISOString() });
                      toast.info(`اولویت به «${PRIORITY_META[next].label}» تغییر یافت`);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />

      <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold text-ink-400 dark:text-ink-500">
        <Icon name="info" size={13} />
        برای تغییر داده‌ها باید یکی از نقش‌های دارای دسترسی «مدیریت درخواست‌ها» وارد شده باشد.
        <Kbd>Ctrl</Kbd> + کلیک برای انتخاب سریع چند ردیف کاربرد دارد.
      </p>
    </div>
  );
}

function RequestRow({
  request,
  selected,
  onToggle,
  reviewers,
  canManage,
  onAssign,
  onPriority,
}: {
  request: RequestRecord;
  selected: boolean;
  onToggle: () => void;
  reviewers: Array<{ id: string; name: string }>;
  canManage: boolean;
  onAssign: (userId: string) => void;
  onPriority: (priority: Priority) => void;
}) {
  const overdue = new Date(request.dueAt).getTime() < Date.now() && !["completed", "rejected"].includes(request.status);
  return (
    <tr
      onDoubleClick={onToggle}
      className={cn(
        "border-b border-[var(--border-soft)] transition last:border-0",
        selected ? "bg-brand-50/70 dark:bg-brand-500/10" : "hover:bg-brand-50/40 dark:hover:bg-brand-500/5",
      )}
    >
      <td className="p-3">
        <input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-brand-600" aria-label={`انتخاب ${request.trackingCode}`} />
      </td>
      <td className="p-3">
        <Link href={`/admin/requests/view?code=${request.trackingCode}`} className="numeric font-black text-brand-700 hover:underline dark:text-brand-300" dir="ltr">
          {request.trackingCode}
        </Link>
        <span className="mt-0.5 block text-[0.62rem] font-bold text-ink-400">{timeAgo(request.createdAt)}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={request.fullName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-black text-ink-900 dark:text-white">{request.fullName}</p>
            <p className="numeric text-[0.64rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
              {request.phone}
            </p>
          </div>
        </div>
      </td>
      <td className="p-3 font-bold text-ink-700 dark:text-ink-200">{request.serviceTitle}</td>
      <td className="p-3">
        <Badge tone={STATUS_META[request.status].tone} dot>
          {STATUS_META[request.status].label}
        </Badge>
        <div className="mt-1.5 w-24">
          <Progress value={STATUS_META[request.status].step} max={5} size="sm" tone="brand" />
        </div>
      </td>
      <td className="p-3">
        {canManage ? (
          <select
            value={request.priority}
            onChange={(e) => onPriority(e.target.value as Priority)}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1 text-[0.72rem] font-bold text-ink-700 dark:text-ink-200"
            aria-label="تغییر اولویت"
          >
            {(Object.keys(PRIORITY_META) as Priority[]).map((key) => (
              <option key={key} value={key}>
                {PRIORITY_META[key].label}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-bold" style={{ color: PRIORITY_META[request.priority].color }}>
            {PRIORITY_META[request.priority].label}
          </span>
        )}
      </td>
      <td className="p-3">
        {canManage ? (
          <select
            value={reviewers.find((user) => user.name === request.assignee)?.id ?? ""}
            onChange={(e) => onAssign(e.target.value)}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-1 text-[0.72rem] font-bold text-ink-700 dark:text-ink-200"
            aria-label="واگذاری کارشناس"
          >
            <option value="">بدون کارشناس</option>
            {reviewers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-bold text-ink-600 dark:text-ink-300">{request.assignee || "—"}</span>
        )}
      </td>
      <td className="p-3">
        <Tooltip content={`مهلت رسیدگی: ${formatDate(request.dueAt, "datetime")}`}>
          <span className={cn("font-bold", overdue ? "text-rose-600 dark:text-rose-400" : "text-ink-600 dark:text-ink-300")}>
            {overdue ? "عقب‌افتاده" : timeAgo(request.dueAt)}
          </span>
        </Tooltip>
      </td>
      <td className="p-3">
        <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-ink-600 dark:text-ink-300">
          <Icon name="folder" size={14} />
          {faNumber(request.attachments.length)}
        </span>
      </td>
      <td className="p-3 text-end">
        <ButtonLink href={`/admin/requests/view?code=${request.trackingCode}`} size="sm" variant="outline" iconEnd="chevronLeft">
          جزئیات
        </ButtonLink>
      </td>
    </tr>
  );
}
