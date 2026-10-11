"use client";

/**
 * بخش‌های مدیریتی سامانه
 * ---------------------------------------------------------------
 * کاربران و نقش‌ها، سابقه رویدادها، تنظیمات و حساب کاربری.
 */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Alert, Avatar, Badge, Button, ButtonLink, Card, Chip, Divider, EmptyState, Kbd, Metric, Progress, Timeline, TimelineItem } from "@/components/ui/primitives";
import { ConfirmDialog, Modal, Tooltip } from "@/components/ui/overlay";
import { Input, Select, Switch, Textarea } from "@/components/ui/form";
import { AdminPageHeader, PermissionNotice, Pagination, TableShell } from "@/components/admin/shell";
import { useStore, PERMISSIONS, type Permission } from "@/lib/store/store";
import { SITE } from "@/lib/content/site";
import { ROLE_META, type Role, type SettingsRecord, type UserRecord } from "@/lib/store/types";
import { faNumber, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ *
 * کاربران و نقش‌ها
 * ------------------------------------------------------------------ */

const ROLE_TONE: Record<Role, string> = { owner: "gold", reviewer: "brand", content: "info", support: "slate" };

export function UsersManager() {
  const { state, can, saveUser, deleteUser, currentUser, toast } = useStore();
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [removing, setRemoving] = useState<UserRecord | null>(null);

  const grouped = useMemo(() => {
    return (Object.keys(ROLE_META) as Role[]).map((role) => ({
      role,
      users: state.users.filter((user) => user.role === role),
    }));
  }, [state.users]);

  if (!can("users.manage")) return <PermissionNotice permission="users.manage" />;

  const blank = (): UserRecord => ({
    id: `usr-${Date.now().toString(36)}`,
    name: "",
    email: "",
    role: "support",
    active: true,
    avatarColor: "#1e7a71",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  });

  return (
    <div>
      <AdminPageHeader
        title="کاربران و نقش‌ها"
        description="کاربران کارکنان و سطح دسترسی هر نقش. هر نقش فقط بخش‌های مجاز خود را در پیشخوان می‌بیند."
        icon="users"
        actions={
          <Button size="sm" icon="plus" onClick={() => setEditing(blank())}>
            کاربر جدید
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(ROLE_META) as Role[]).map((role) => (
          <Card key={role} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <Badge tone={ROLE_TONE[role]} dot>
                {ROLE_META[role].label}
              </Badge>
              <span className="numeric text-2xl font-black text-ink-900 dark:text-white">
                {faNumber(state.users.filter((u) => u.role === role).length)}
              </span>
            </div>
            <p className="mt-3 text-[0.74rem] leading-7 text-ink-600 dark:text-ink-300">{ROLE_META[role].description}</p>
            <p className="mt-3 text-[0.66rem] font-black text-ink-400">{PERMISSIONS[role].length} دسترسی تعریف‌شده</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {grouped.map((group) => (
          <div key={group.role}>
            <h2 className="mb-3 flex items-center gap-2 font-black text-ink-900 dark:text-white">
              <Icon name="key" size={17} className="text-brand-600 dark:text-brand-400" />
              {ROLE_META[group.role].label}
              <span className="numeric text-[0.72rem] font-bold text-ink-400">({faNumber(group.users.length)} کاربر)</span>
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {group.users.map((user) => (
                <Card key={user.id} className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar name={user.name} color={user.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-ink-900 dark:text-white">{user.name}</p>
                      {currentUser?.id === user.id && (
                        <Badge tone="brand" size="sm">
                          حساب شما
                        </Badge>
                      )}
                      <Badge tone={user.active ? "emerald" : "slate"} size="sm" dot>
                        {user.active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <p className="text-[0.7rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                      {user.email}
                    </p>
                    <p className="mt-0.5 text-[0.64rem] font-bold text-ink-400">
                      {user.lastLoginAt ? `آخرین ورود: ${timeAgo(user.lastLoginAt)}` : "تاکنون وارد نشده"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tooltip content={user.active ? "غیرفعال کردن حساب" : "فعال کردن حساب"}>
                      <button
                        type="button"
                        onClick={() => {
                          saveUser({ ...user, active: !user.active });
                          toast.info(user.active ? "حساب غیرفعال شد" : "حساب فعال شد");
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-500 transition hover:text-brand-700"
                        aria-label="تغییر وضعیت حساب"
                      >
                        <Icon name={user.active ? "eyeOff" : "eye"} size={16} />
                      </button>
                    </Tooltip>
                    <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(user)}>
                      ویرایش
                    </Button>
                    <Button size="sm" variant="ghost" icon="trash" disabled={user.id === currentUser?.id} onClick={() => setRemoving(user)}>
                      حذف
                    </Button>
                  </div>
                </Card>
              ))}
              {group.users.length === 0 && (
                <p className="text-[0.76rem] font-bold text-ink-400">کاربری با این نقش ثبت نشده است.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-black text-ink-900 dark:text-white">ماتریس دسترسی نقش‌ها</h2>
        <p className="mt-1 text-[0.74rem] font-bold text-ink-500 dark:text-ink-400">
          دسترسی‌ها در سامانه به‌صورت نقش‌محور کنترل می‌شود؛ این جدول مرجع بررسی است.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-[0.74rem]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-[0.66rem] font-black text-ink-500 dark:text-ink-400">
                <th className="p-2 text-start">دسترسی</th>
                {(Object.keys(ROLE_META) as Role[]).map((role) => (
                  <th key={role} className="p-2 text-center">
                    {ROLE_META[role].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(Object.values(PERMISSIONS).flat())).map((permission) => (
                <tr key={permission} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="p-2 font-bold text-ink-700 dark:text-ink-200" dir="ltr">
                    {permission}
                  </td>
                  {(Object.keys(ROLE_META) as Role[]).map((role) => (
                    <td key={role} className="p-2 text-center">
                      {PERMISSIONS[role].includes(permission as Permission) ? (
                        <Icon name="checkCircle" size={16} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.name ? "ویرایش کاربر" : "کاربر جدید"}>
        {editing && (
          <div className="space-y-4">
            <Input label="نام و نام خانوادگی" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="ایمیل" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} dir="ltr" className="text-start" />
            <Select
              label="نقش"
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
              options={(Object.keys(ROLE_META) as Role[]).map((role) => ({ value: role, label: `${ROLE_META[role].label} — ${ROLE_META[role].description}` }))}
              help="با تغییر نقش، دسترسی‌های کاربر در پیشخوان به‌روز می‌شود."
            />
            <Input label="رنگ نمایه" value={editing.avatarColor} onChange={(e) => setEditing({ ...editing, avatarColor: e.target.value })} dir="ltr" />
            <Switch checked={editing.active} onChange={(checked) => setEditing({ ...editing, active: checked })} label="حساب فعال باشد" />
            <div className="flex items-center gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                icon="save"
                disabled={editing.name.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(editing.email)}
                onClick={() => {
                  saveUser(editing);
                  toast.success("کاربر ذخیره شد");
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
            deleteUser(removing.id);
            toast.warning("کاربر حذف شد");
          }
        }}
        title="حذف کاربر؟"
        description="با حذف کاربر، دسترسی او به پیشخوان قطع می‌شود. پرونده‌های واگذارشده بدون کارشناس خواهند شد."
        confirmLabel="بله، حذف کن"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * سابقه رویدادها
 * ------------------------------------------------------------------ */

export function AuditManager() {
  const { state, can } = useStore();
  const [severity, setSeverity] = useState("all");
  const [actor, setActor] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const actors = useMemo(() => Array.from(new Set(state.audit.map((item) => item.actor))), [state.audit]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.audit
      .filter((item) => (severity === "all" ? true : item.severity === severity))
      .filter((item) => (actor === "all" ? true : item.actor === actor))
      .filter((item) => (q ? `${item.detail} ${item.action} ${item.entity} ${item.entityId}`.toLowerCase().includes(q) : true));
  }, [state.audit, severity, actor, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const rows = filtered.slice((page - 1) * 20, page * 20);

  if (!can("logs.view")) return <PermissionNotice permission="logs.view" />;

  const critical = state.audit.filter((item) => item.severity === "critical").length;
  const warnings = state.audit.filter((item) => item.severity === "warning").length;

  return (
    <div>
      <AdminPageHeader
        title="سابقه رویدادها"
        description="هر اقدام مهم در سامانه ثبت می‌شود: تغییر وضعیت پرونده‌ها، ویرایش محتوا، مدیریت کاربران، ورود و خروج و تغییر تنظیمات."
        icon="archive"
        actions={
          <Button
            size="sm"
            variant="outline"
            icon="download"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state.audit, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "audit-log.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            خروجی JSON
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="کل رویدادها" value={faNumber(state.audit.length)} icon="archive" />
        <Metric label="هشدارها" value={faNumber(warnings)} icon="alert" tone="gold" />
        <Metric label="موارد بحرانی" value={faNumber(critical)} icon="alertCircle" tone="danger" />
      </div>

      <Card className="mt-5 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <Input
            label="جست‌وجو"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="شرح رویداد، اقدام یا شناسه"
            icon="search"
          />
          <Select
            label="سطح"
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "همه سطوح" },
              { value: "info", label: "اطلاع" },
              { value: "warning", label: "هشدار" },
              { value: "critical", label: "بحرانی" },
            ]}
          />
          <Select
            label="کاربر"
            value={actor}
            onChange={(e) => {
              setActor(e.target.value);
              setPage(1);
            }}
            options={[{ value: "all", label: "همه کاربران" }, ...actors.map((name) => ({ value: name, label: name }))]}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip active={severity === "all"} onClick={() => { setSeverity("all"); setPage(1); }} count={state.audit.length}>
            همه
          </Chip>
          {(["info", "warning", "critical"] as const).map((level) => (
            <Chip key={level} active={severity === level} onClick={() => { setSeverity(level); setPage(1); }} count={state.audit.filter((a) => a.severity === level).length}>
              {level === "info" ? "اطلاع" : level === "warning" ? "هشدار" : "بحرانی"}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon="archive" title="رویدادی با این فیلترها ثبت نشده" />
        ) : (
          <TableShell>
            <table className="w-full min-w-[48rem] text-[0.78rem]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/60 text-[0.66rem] font-black text-ink-500 dark:text-ink-400">
                  <th className="p-3 text-start">زمان</th>
                  <th className="p-3 text-start">کاربر</th>
                  <th className="p-3 text-start">اقدام</th>
                  <th className="p-3 text-start">موجودیت</th>
                  <th className="p-3 text-start">شرح</th>
                  <th className="p-3 text-start">سطح</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border-soft)] last:border-0">
                    <td className="p-3">
                      <span className="font-bold text-ink-600 dark:text-ink-300">{formatDate(item.at, "datetime")}</span>
                      <span className="mt-0.5 block text-[0.62rem] font-bold text-ink-400">{timeAgo(item.at)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={item.actor} size="sm" />
                        <span className="font-bold text-ink-700 dark:text-ink-200">{item.actor}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge tone="slate" size="sm" className="numeric" dir="ltr">
                        {item.action}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-[0.7rem] font-bold text-ink-600 dark:text-ink-300" dir="ltr">
                        {item.entity}:{item.entityId}
                      </span>
                    </td>
                    <td className="max-w-md p-3 text-[0.74rem] font-bold leading-7 text-ink-700 dark:text-ink-200">{item.detail}</td>
                    <td className="p-3">
                      <Badge tone={item.severity === "critical" ? "rose" : item.severity === "warning" ? "amber" : "info"} size="sm" dot>
                        {item.severity === "critical" ? "بحرانی" : item.severity === "warning" ? "هشدار" : "اطلاع"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * تنظیمات
 * ------------------------------------------------------------------ */

export function SettingsManager() {
  const { state, can, saveSettings, exportJson, toast, resetDemo } = useStore();
  const [draft, setDraft] = useState<SettingsRecord>(state.settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAllReset, setConfirmAllReset] = useState(false);

  if (!can("settings.manage")) return <PermissionNotice permission="settings.manage" />;

  const set = <K extends keyof SettingsRecord>(key: K, value: SettingsRecord[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const dirty = JSON.stringify(draft) !== JSON.stringify(state.settings);

  return (
    <div>
      <AdminPageHeader
        title="تنظیمات سامانه"
        description="اطلاعات دفتر، کانال‌های اطلاع‌رسانی، محدودیت بارگذاری فایل و گزینه‌های امنیتی و رضایت‌سنجی."
        icon="gear"
        actions={
          <>
            <Button size="sm" variant="ghost" icon="refresh" disabled={!dirty} onClick={() => setDraft(state.settings)}>
              بازگردانی تغییرات
            </Button>
            <Button
              size="sm"
              icon="save"
              disabled={!dirty}
              onClick={() => {
                saveSettings(draft);
                toast.success("تنظیمات ذخیره شد");
              }}
            >
              ذخیره تنظیمات
            </Button>
          </>
        }
      />

      {dirty && (
        <Alert tone="warning" icon="edit" className="mb-5">
          تغییرات ذخیره‌نشده دارید. برای اعمال، دکمه «ذخیره تنظیمات» را بزنید.
        </Alert>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="building" size={18} className="text-brand-600 dark:text-brand-400" />
            اطلاعات دفتر
          </h2>
          <div className="mt-4 space-y-4">
            <Input label="نام دفتر" value={draft.officeName} onChange={(e) => set("officeName", e.target.value)} />
            <Input label="شعار" value={draft.slogan} onChange={(e) => set("slogan", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="تلفن همراه" value={draft.phone1} onChange={(e) => set("phone1", e.target.value)} dir="ltr" className="text-start" />
              <Input label="تلفن ثابت" value={draft.phone2} onChange={(e) => set("phone2", e.target.value)} dir="ltr" className="text-start" />
            </div>
            <Input label="ایمیل" value={draft.email} onChange={(e) => set("email", e.target.value)} dir="ltr" className="text-start" />
            <Textarea label="نشانی" rows={2} value={draft.address} onChange={(e) => set("address", e.target.value)} />
            <Input label="خلاصه ساعات کاری" value={draft.hoursSummary} onChange={(e) => set("hoursSummary", e.target.value)} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="upload" size={18} className="text-brand-600 dark:text-brand-400" />
            محدودیت بارگذاری مدارک
          </h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="حداکثر حجم هر فایل (مگابایت)"
                type="number"
                numeric
                value={draft.maxFileMb}
                onChange={(e) => set("maxFileMb", Number(e.target.value) || 1)}
              />
              <Input
                label="حداکثر تعداد فایل"
                type="number"
                numeric
                value={draft.maxFiles}
                onChange={(e) => set("maxFiles", Number(e.target.value) || 1)}
              />
            </div>
            <Input
              label="پسوندهای مجاز"
              value={draft.allowedExtensions}
              onChange={(e) => set("allowedExtensions", e.target.value)}
              help="با کاما جدا کنید؛ مثلاً: pdf,jpg,png"
              dir="ltr"
              className="text-start"
            />
            <Alert tone="info" icon="info">
              این محدودیت‌ها در فرم ثبت درخواست اعمال می‌شود و هنگام انتخاب فایل نامعتبر، پیام راهنما نمایش داده می‌شود.
            </Alert>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="send" size={18} className="text-brand-600 dark:text-brand-400" />
            کانال‌های اطلاع‌رسانی
          </h2>
          <div className="mt-4 space-y-3">
            <Switch checked={draft.notifyEmail} onChange={(v) => set("notifyEmail", v)} label="اطلاع‌رسانی ایمیلی" description="ارسال تأیید ثبت و تغییر وضعیت به ایمیل متقاضی" />
            <Switch checked={draft.notifySms} onChange={(v) => set("notifySms", v)} label="اطلاع‌رسانی پیامکی" description="ارسال پیامک برای تغییرهای مهم وضعیت" />
            <Switch checked={draft.notifyTelegram} onChange={(v) => set("notifyTelegram", v)} label="اطلاع‌رسانی تلگرامی" description="ارسال پیام در تلگرام برای موارد ثبت‌شده با این کانال" />
            <Divider />
            <Switch checked={draft.autoReply} onChange={(v) => set("autoReply", v)} label="پاسخ خودکار پس از ثبت درخواست" description="ارسال پیام تأیید بلافاصله پس از ثبت فرم" />
            <Switch checked={draft.weeklyReport} onChange={(v) => set("weeklyReport", v)} label="گزارش هفتگی برای مدیر" description="خلاصه آماری درخواست‌ها و زمان پاسخ‌دهی" />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-black text-ink-900 dark:text-white">
            <Icon name="shieldCheck" size={18} className="text-brand-600 dark:text-brand-400" />
            امنیت و کیفیت
          </h2>
          <div className="mt-4 space-y-3">
            <Switch checked={draft.twoFactorForAdmins} onChange={(v) => set("twoFactorForAdmins", v)} label="ورود دومرحله‌ای برای مدیران" description="در نسخه نمایشی فقط وضعیت آن ثبت می‌شود" />
            <Switch checked={draft.satisfactionSurvey} onChange={(v) => set("satisfactionSurvey", v)} label="نظرسنجی رضایت پس از تکمیل" description="امکان ثبت امتیاز در صفحه پیگیری" />
            <Switch checked={draft.maintenance} onChange={(v) => set("maintenance", v)} label="حالت تعمیرات" description="نمایش پیام تعمیرات در سایت عمومی" />
          </div>
          {draft.maintenance && (
            <Alert tone="danger" icon="alert" className="mt-4">
              در حالت تعمیرات، پیام «سامانه در حال به‌روزرسانی است» به مراجعان نمایش داده می‌شود.
            </Alert>
          )}
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <h2 className="font-black text-ink-900 dark:text-white">پشتیبان‌گیری و بازنشانی</h2>
        <p className="mt-1 text-[0.76rem] leading-7 text-ink-600 dark:text-ink-300">
          خروجی کامل داده‌های نسخه نمایشی (درخواست‌ها، محتوا، کاربران، تنظیمات و رویدادها) به‌صورت فایل JSON قابل ذخیره است.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            icon="download"
            onClick={() => {
              const blob = new Blob([exportJson()], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "khadamat447-backup.json";
              link.click();
              URL.revokeObjectURL(url);
              toast.success("فایل پشتیبان ساخته شد");
            }}
          >
            دریافت فایل پشتیبان
          </Button>
          <Button variant="ghost" icon="refresh" onClick={() => setConfirmReset(true)}>
            بازگردانی تنظیمات پیش‌فرض
          </Button>
          <Button variant="danger" icon="trash" onClick={() => setConfirmAllReset(true)}>
            بازنشانی کل داده‌های نمایشی
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          saveSettings({
            officeName: SITE.name,
            slogan: SITE.slogan,
            phone1: SITE.phones[0].value,
            phone2: SITE.phones[1].value,
            email: SITE.email,
            address: SITE.addressFull,
            hoursSummary: SITE.hoursSummary,
            maxFileMb: 5,
            maxFiles: 4,
            allowedExtensions: ".pdf,.jpg,.jpeg,.png,.webp",
            autoReply: true,
            notifyEmail: true,
            notifySms: true,
            notifyTelegram: false,
            maintenance: false,
            weeklyReport: true,
            satisfactionSurvey: true,
            twoFactorForAdmins: false,
          });
          toast.info("تنظیمات به حالت پیش‌فرض بازگشت");
        }}
        title="بازگردانی تنظیمات پیش‌فرض؟"
        description="همه تنظیمات این بخش به مقدارهای اولیه بازمی‌گردد. درخواست‌ها و محتوا تغییری نمی‌کند."
        confirmLabel="بله، بازگردان"
      />

      <ConfirmDialog
        open={confirmAllReset}
        onClose={() => setConfirmAllReset(false)}
        onConfirm={() => resetDemo()}
        title="بازنشانی کل داده‌های نمایشی؟"
        description="همه تغییرات شما در درخواست‌ها، محتوا، کاربران، اعلان‌ها و تنظیمات حذف می‌شود و داده‌های نمونه اولیه بازمی‌گردد."
        confirmLabel="بله، همه را بازنشانی کن"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * حساب کاربری
 * ------------------------------------------------------------------ */

export function AccountManager() {
  const { currentUser, role, state, saveUser, toast, logout, resetDemo } = useStore();
  const [draft, setDraft] = useState<UserRecord | null>(currentUser);
  const [confirmReset, setConfirmReset] = useState(false);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    setDraft(currentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  if (!currentUser || !role) return null;

  const myAudit = state.audit.filter((item) => item.actor === currentUser.name).slice(0, 12);
  const myRequests = state.requests.filter((item) => item.assignee === currentUser.name);

  return (
    <div>
      <AdminPageHeader
        title="حساب کاربری من"
        description="اطلاعات نمایه، نقش و دسترسی‌ها، فعالیت‌های اخیر و کارهای در جریان شما."
        icon="user"
        actions={
          <>
            <Button variant="ghost" size="sm" icon="logout" onClick={logout}>
              خروج از حساب
            </Button>
            <Button variant="danger" size="sm" icon="refresh" onClick={() => setConfirmReset(true)}>
              بازنشانی داده‌های نمایشی
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size="lg" />
            <div>
              <h2 className="font-black text-ink-900 dark:text-white">{currentUser.name}</h2>
              <p className="text-[0.74rem] font-bold text-ink-500 dark:text-ink-400" dir="ltr">
                {currentUser.email}
              </p>
              <Badge tone={ROLE_TONE[currentUser.role]} className="mt-2">
                {ROLE_META[currentUser.role].label}
              </Badge>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Input label="نام نمایشی" value={draft?.name ?? ""} onChange={(e) => setDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))} />
            <Input label="ایمیل" value={draft?.email ?? ""} onChange={(e) => setDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))} dir="ltr" className="text-start" />
            <Input label="رنگ نمایه" value={draft?.avatarColor ?? ""} onChange={(e) => setDraft((prev) => (prev ? { ...prev, avatarColor: e.target.value } : prev))} dir="ltr" />
            <Button
              icon="save"
              disabled={!draft || draft.name.trim().length < 3}
              onClick={() => {
                if (!draft) return;
                saveUser(draft);
                toast.success("نمایه به‌روز شد");
              }}
            >
              ذخیره نمایه
            </Button>
          </div>

          <Divider label="اطلاعات نشست" />
          <dl className="space-y-2 text-[0.76rem]">
            {[
              { label: "آخرین ورود", value: currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt, "datetime") : "—" },
              { label: "عضویت از", value: formatDate(currentUser.createdAt, "medium") },
              { label: "تعداد کارهای در جریان", value: `${faNumber(myRequests.filter((r) => !["completed", "rejected"].includes(r.status)).length)} پرونده` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                <dt className="font-bold text-ink-500 dark:text-ink-400">{row.label}</dt>
                <dd className="font-black text-ink-900 dark:text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-black text-ink-900 dark:text-white">دسترسی‌های نقش من</h2>
            <p className="mt-1 text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">{ROLE_META[currentUser.role].description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {PERMISSIONS[currentUser.role].map((permission) => (
                <div key={permission} className="flex items-center gap-2 rounded-2xl bg-emerald-50/70 px-3.5 py-2.5 text-[0.72rem] font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Icon name="checkCircle" size={15} />
                  <span className="numeric" dir="ltr">
                    {permission}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={(PERMISSIONS[currentUser.role].length / 9) * 100} tone="success" size="sm" showLabel />
            <p className="mt-2 text-[0.68rem] font-bold text-ink-400">
              برای تغییر دسترسی‌ها، مدیر کل می‌تواند نقش شما را در بخش «کاربران» تغییر دهد.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-black text-ink-900 dark:text-white">کارهای در جریان من</h2>
            {myRequests.length === 0 ? (
              <p className="mt-3 text-[0.76rem] font-bold text-ink-500 dark:text-ink-400">در حال حاضر پرونده‌ای به شما واگذار نشده است.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {myRequests.slice(0, 6).map((request) => (
                  <li key={request.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-muted)]/70 px-3.5 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[0.76rem] font-black text-ink-900 dark:text-white">{request.fullName}</span>
                      <span className="numeric block text-[0.64rem] font-bold text-ink-400" dir="ltr">
                        {request.trackingCode}
                      </span>
                    </span>
                    <ButtonLink href={`/admin/requests/view?code=${request.trackingCode}`} size="sm" variant="ghost" iconEnd="chevronLeft">
                      بررسی
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-black text-ink-900 dark:text-white">فعالیت‌های اخیر من</h2>
            {myAudit.length === 0 ? (
              <p className="mt-3 text-[0.76rem] font-bold text-ink-500 dark:text-ink-400">فعالیتی ثبت نشده است.</p>
            ) : (
              <Timeline className="mt-4">
                {myAudit.map((item) => (
                  <TimelineItem key={item.id} title={item.detail} meta={`${timeAgo(item.at)} • ${item.action}`} color={item.severity === "critical" ? "#f43f5e" : item.severity === "warning" ? "#f59e0b" : "#1e7a71"} />
                ))}
              </Timeline>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => resetDemo()}
        title="بازنشانی داده‌های نمایشی؟"
        description="همه تغییرات این مرورگر حذف و داده‌های نمونه بازگردانده می‌شود."
        confirmLabel="بله، بازنشانی کن"
      />
    </div>
  );
}
