"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, Chip, EmptyState, Skeleton } from "@/components/ui";
import { StatusBadge, RequestStatusCard } from "@/components/track/status-view";
import { useStore } from "@/lib/store/store";
import { STATUS_META, type RequestStatus } from "@/lib/store/types";
import { formatDate, timeAgo } from "@/lib/format";
import { toFaDigits } from "@/lib/digits";

export function MyRequestsPanel() {
  const { myRequestList, forgetRequest, ready, setRating, toast } = useStore();
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? myRequestList : myRequestList.filter((r) => r.status === filter)),
    [myRequestList, filter],
  );

  const active = filtered.find((r) => r.id === selected) ?? myRequestList.find((r) => r.id === selected);

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (myRequestList.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="هنوز درخواستی در این مرورگر ثبت نشده است"
        description="پس از ثبت اولین درخواست، کد پیگیری و وضعیت آن به‌صورت خودکار در این کارتابل ذخیره می‌شود تا دسترسی سریع‌تری داشته باشید."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/request"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-4 py-2.5 text-[0.8rem] font-black text-white transition hover:bg-brand-700"
            >
              <Icon name="send" size={16} />
              ثبت درخواست جدید
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--border-soft)] px-4 py-2.5 text-[0.8rem] font-black text-ink-700 transition hover:border-brand-300 dark:text-ink-200"
            >
              <Icon name="search" size={16} />
              پیگیری با کد
            </Link>
          </div>
        }
      />
    );
  }

  const statusOptions: Array<{ id: "all" | RequestStatus; label: string }> = [
    { id: "all", label: "همه" },
    ...(Object.keys(STATUS_META) as RequestStatus[])
      .filter((key) => myRequestList.some((r) => r.status === key))
      .map((key) => ({ id: key, label: STATUS_META[key].label })),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-start">
      <div className="space-y-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {statusOptions.map((option) => (
            <Chip
              key={option.id}
              active={filter === option.id}
              onClick={() => setFilter(option.id)}
              count={option.id === "all" ? myRequestList.length : myRequestList.filter((r) => r.status === option.id).length}
            >
              {option.label}
            </Chip>
          ))}
        </div>

        <ul className="space-y-3">
          {filtered.map((request) => (
            <li key={request.id}>
              <button
                type="button"
                onClick={() => setSelected(request.id)}
                className={`w-full text-start transition ${selected === request.id ? "" : "hover:opacity-95"}`}
              >
                <Card
                  className={`p-5 ${selected === request.id ? "border-brand-300 ring-2 ring-brand-500/15 dark:border-brand-400/40" : ""}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="numeric text-[0.86rem] font-black tracking-wider text-ink-900 dark:text-white" dir="ltr">
                        {request.trackingCode}
                      </p>
                      <p className="mt-1 truncate text-[0.8rem] font-bold text-ink-700 dark:text-ink-200">{request.serviceTitle}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" size={13} />
                      {formatDate(request.createdAt, "medium")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="refresh" size={13} />
                      {timeAgo(request.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="upload" size={13} />
                      {toFaDigits(request.attachments.length)} مدرک
                    </span>
                  </div>
                </Card>
              </button>

              <div className="mt-2 flex justify-end gap-2">
                <Link
                  href={`/track?code=${request.trackingCode}`}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[0.7rem] font-black text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
                >
                  <Icon name="external" size={13} />
                  صفحه پیگیری
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    forgetRequest(request.trackingCode);
                    if (selected === request.id) setSelected(null);
                    toast.info("از کارتابل حذف شد", "کد پیگیری در سامانه باقی می‌ماند و قابل جست‌وجو است.");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[0.7rem] font-black text-ink-500 transition hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-white/10"
                >
                  <Icon name="trash" size={13} />
                  حذف از فهرست
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Card className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-muted)]/60 p-4">
          <p className="text-[0.74rem] font-bold text-ink-600 dark:text-ink-300">
            این فهرست فقط در همین مرورگر ذخیره شده است.
          </p>
          <Link
            href="/request"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[0.74rem] font-black text-white transition hover:bg-brand-700"
          >
            <Icon name="plus" size={15} />
            درخواست جدید
          </Link>
        </Card>
      </div>

      <div className="lg:sticky lg:top-28">
        {active ? (
          <RequestStatusCard
            request={active}
            onRate={(rating) => {
              setRating(active.id, rating);
              toast.success("نظر شما ثبت شد", `امتیاز ${toFaDigits(rating)} از ۵`);
            }}
          />
        ) : (
          <Card className="p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon name="layers" size={26} />
            </span>
            <h2 className="mt-4 font-black text-ink-900 dark:text-white">یک درخواست را انتخاب کنید</h2>
            <p className="mt-2 text-[0.82rem] leading-7 text-ink-600 dark:text-ink-300">
              با انتخاب هر درخواست، وضعیت، خط زمان رویدادها و اطلاعات ثبت‌شده آن در همین صفحه نمایش داده می‌شود.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Badge tone="brand" icon="track">
                خط زمان رویدادها
              </Badge>
              <Badge tone="gold" icon="upload">
                مدارک پیوست
              </Badge>
              <Badge tone="info" icon="star">
                ثبت رضایت
              </Badge>
            </div>
            <Button variant="outline" className="mt-6" icon="search" >
              <Link href="/track">جست‌وجوی کد پیگیری دیگر</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
