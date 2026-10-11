"use client";

/**
 * فروشگاه وضعیت سامانه (Client Store)
 * ---------------------------------------------------------------
 * یک فروشگاه سبک مبتنی بر React Context + localStorage که کل منطق دامنه
 * (ثبت درخواست، تغییر وضعیت، محتوا، اعلان‌ها، کاربران، تنظیمات و سابقه
 * رویدادها) را در مرورگر اجرا می‌کند تا نسخه نمایشی، کاملاً کاربردی باشد.
 *
 * همه اقدام‌ها «سابقه رویداد» تولید می‌کنند و از قواعد دسترسی نقش‌محور
 * (مثل نسخه سروری) پیروی می‌کنند.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  DEMO_CREDENTIALS,
  FIXED_NOW,
  STORAGE_KEY,
  buildSeed,
  buildStats,
  makeRequest,
} from "./seed";
import type {
  AppState,
  ArticleRecord,
  Attachment,
  AuditRecord,
  Channel,
  DashboardStats,
  EventVisibility,
  FaqRecord,
  NewRequestInput,
  NotificationRecord,
  Priority,
  RequestRecord,
  RequestStatus,
  Role,
  ServiceRecord,
  SettingsRecord,
  UserRecord,
  AnnouncementRecord,
} from "./types";
import { STATUS_META } from "./types";
import { sanitizeState } from "./migrate";

/* ------------------------------------------------------------------ *
 * دسترسی‌ها
 * ------------------------------------------------------------------ */

export type Permission =
  | "dashboard.view"
  | "requests.view"
  | "requests.manage"
  | "requests.delete"
  | "content.manage"
  | "users.manage"
  | "logs.view"
  | "notifications.manage"
  | "settings.manage";

export const PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "dashboard.view",
    "requests.view",
    "requests.manage",
    "requests.delete",
    "content.manage",
    "users.manage",
    "logs.view",
    "notifications.manage",
    "settings.manage",
  ],
  reviewer: ["dashboard.view", "requests.view", "requests.manage", "notifications.manage"],
  content: ["dashboard.view", "content.manage", "settings.manage"],
  support: ["dashboard.view", "requests.view", "notifications.manage"],
};

/* ------------------------------------------------------------------ *
 * اعلان‌های کوچک (Toast)
 * ------------------------------------------------------------------ */

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "error" | "info" | "warning";
}

interface ToastApi {
  push: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

/* ------------------------------------------------------------------ *
 * اقدام‌ها
 * ------------------------------------------------------------------ */

export interface StoreActions {
  /* درخواست‌ها */
  addRequest: (input: NewRequestInput) => RequestRecord | null;
  updateRequest: (id: string, patch: Partial<RequestRecord>) => void;
  changeStatus: (
    id: string,
    status: RequestStatus,
    note: string,
    options?: { visibility?: EventVisibility; channel?: Channel; actor?: string },
  ) => void;
  addNote: (id: string, body: string) => void;
  addAttachment: (id: string, attachment: Attachment) => void;
  removeAttachment: (id: string, attachmentId: string) => void;
  verifyAttachment: (id: string, attachmentId: string, verified: boolean) => void;
  deleteRequest: (id: string) => void;
  setRating: (id: string, rating: number) => void;
  /* کارتابل من */
  rememberRequest: (code: string) => void;
  forgetRequest: (code: string) => void;
  /* محتوا */
  updateService: (slug: string, patch: Partial<ServiceRecord>) => void;
  saveFaq: (faq: FaqRecord) => void;
  deleteFaq: (id: string) => void;
  saveArticle: (article: ArticleRecord) => void;
  deleteArticle: (id: string) => void;
  saveAnnouncement: (item: AnnouncementRecord) => void;
  deleteAnnouncement: (id: string) => void;
  /* کاربران و تنظیمات */
  saveUser: (user: UserRecord) => void;
  deleteUser: (id: string) => void;
  saveSettings: (patch: Partial<SettingsRecord>) => void;
  /* اعلان‌ها */
  retryNotification: (id: string) => void;
  sendTestNotification: (channel: Channel) => void;
  /* نشست */
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  can: (permission: Permission) => boolean;
  /* عمومی */
  resetDemo: () => void;
  exportJson: () => string;
}

interface StoreValue extends StoreActions {
  state: AppState;
  ready: boolean;
  stats: DashboardStats;
  currentUser: UserRecord | null;
  role: Role | null;
  activeAnnouncements: AnnouncementRecord[];
  requestByCode: (code: string) => RequestRecord | undefined;
  myRequestList: RequestRecord[];
  serviceBySlug: (slug: string) => ServiceRecord | undefined;
  toast: ToastApi;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function auditEntry(
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  detail: string,
  severity: AuditRecord["severity"] = "info",
): AuditRecord {
  return {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    actor,
    action,
    entity,
    entityId,
    detail,
    severity,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => buildSeed(new Date(FIXED_NOW)));
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  /* بارگذاری از حافظه مرورگر */
  useEffect(() => {
    let next: AppState | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) next = sanitizeState(JSON.parse(raw) as Partial<AppState>);
    } catch {
      next = null;
    }
    setState(next ?? buildSeed(new Date()));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ذخیره در حافظه مرورگر */
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, hydratedAt: new Date().toISOString() }));
    } catch {
      /* حافظه پر یا غیرفعال — بی‌صدا رد می‌شود */
    }
  }, [state, ready]);

  const toast = useMemo<ToastApi>(() => {
    const push = (t: Omit<ToastItem, "id">) => {
      const item = { ...t, id: ++toastId.current };
      setToasts((prev) => [...prev.slice(-3), item]);
      if (typeof window !== "undefined") {
        window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== item.id)), 4800);
      }
    };
    return {
      push,
      success: (title, description) => push({ title, description, tone: "success" }),
      error: (title, description) => push({ title, description, tone: "error" }),
      info: (title, description) => push({ title, description, tone: "info" }),
      warning: (title, description) => push({ title, description, tone: "warning" }),
    };
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const currentUser = useMemo(
    () => (state.session ? state.users.find((u) => u.id === state.session?.userId) ?? null : null),
    [state.session, state.users],
  );
  const role = currentUser?.role ?? null;

  const actorName = currentUser?.name ?? "کاربر مهمان";

  const can = useCallback(
    (permission: Permission) => (role ? PERMISSIONS[role].includes(permission) : false),
    [role],
  );

  const stats = useMemo(() => buildStats(state, ready ? new Date() : new Date(FIXED_NOW)), [state, ready]);

  /* ---------------------------- اقدام‌ها ---------------------------- */

  const addRequest = useCallback<StoreActions["addRequest"]>(
    (input) => {
      const service = state.services.find((s) => s.slug === input.serviceSlug && s.active);
      if (!service) {
        toast.error("خدمت انتخاب‌شده فعال نیست", "خدمت دیگری را انتخاب کنید.");
        return null;
      }
      const record = makeRequest(input, service);
      setState((prev) => ({
        ...prev,
        requests: [record, ...prev.requests],
        services: prev.services.map((s) =>
          s.slug === service.slug ? { ...s, requestsCount: s.requestsCount + 1 } : s,
        ),
        myRequests: Array.from(new Set([record.trackingCode, ...prev.myRequests])),
        notifications:
          prev.settings.autoReply
            ? [
                {
                  id: `ntf-${Date.now().toString(36)}-a`,
                  channel: "email",
                  recipient: "Info@Khadamat447.IR",
                  subject: `درخواست جدید — ${service.title}`,
                  body: `درخواست جدیدی با کد ${record.trackingCode} از طرف ${record.fullName} ثبت شد.`,
                  status: "sent",
                  attempts: 1,
                  requestId: record.id,
                  trackingCode: record.trackingCode,
                  createdAt: new Date().toISOString(),
                  sentAt: new Date().toISOString(),
                  error: null,
                },
                ...(prev.settings.notifySms
                  ? [
                      {
                        id: `ntf-${Date.now().toString(36)}-b`,
                        channel: "sms" as Channel,
                        recipient: record.phone,
                        subject: "تأیید ثبت درخواست",
                        body: `درخواست شما با کد ${record.trackingCode} ثبت شد.`,
                        status: "sent" as const,
                        attempts: 1,
                        requestId: record.id,
                        trackingCode: record.trackingCode,
                        createdAt: new Date().toISOString(),
                        sentAt: new Date().toISOString(),
                        error: null,
                      },
                    ]
                  : []),
                ...prev.notifications,
              ]
            : prev.notifications,
        audit: [
          auditEntry("سامانه", "ثبت درخواست جدید", "request", record.id, `${record.trackingCode} — ${service.title}`),
          ...prev.audit,
        ],
      }));
      return record;
    },
    [state.services, toast],
  );

  const updateRequest = useCallback<StoreActions["updateRequest"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
      ),
    }));
  }, []);

  const changeStatus = useCallback<StoreActions["changeStatus"]>(
    (id, status, note, options) => {
      const visibility = options?.visibility ?? "public";
      const actor = options?.actor ?? actorName;
      const nowIso = new Date().toISOString();
      setState((prev) => {
        const target = prev.requests.find((r) => r.id === id);
        if (!target) return prev;
        const event = {
          id: `ev-${Date.now().toString(36)}`,
          at: nowIso,
          status,
          note: note || STATUS_META[status].description,
          actor,
          visibility,
          channel: options?.channel,
        };
        const notification: NotificationRecord | null =
          visibility === "public" && (prev.settings.notifySms || prev.settings.notifyEmail)
            ? {
                id: `ntf-${Date.now().toString(36)}-s`,
                channel: options?.channel ?? (prev.settings.notifySms ? "sms" : "email"),
                recipient: prev.settings.notifySms ? target.phone : target.email || target.phone,
                subject: `تغییر وضعیت درخواست ${target.trackingCode}`,
                body: `وضعیت درخواست شما به «${STATUS_META[status].label}» تغییر کرد. ${note}`,
                status: "sent",
                attempts: 1,
                requestId: target.id,
                trackingCode: target.trackingCode,
                createdAt: nowIso,
                sentAt: nowIso,
                error: null,
              }
            : null;
        return {
          ...prev,
          requests: prev.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  updatedAt: nowIso,
                  assignee: r.assignee || actor,
                  timeline: [...r.timeline, event],
                }
              : r,
          ),
          notifications: notification ? [notification, ...prev.notifications] : prev.notifications,
          audit: [
            auditEntry(actor, "تغییر وضعیت درخواست", "request", id, `${target.trackingCode}: ${STATUS_META[status].label}`),
            ...prev.audit,
          ],
        };
      });
      toast.success("وضعیت درخواست به‌روزرسانی شد", `وضعیت جدید: ${STATUS_META[status].label}`);
    },
    [actorName, toast],
  );

  const addNote = useCallback<StoreActions["addNote"]>(
    (id, body) => {
      if (!body.trim()) return;
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === id
            ? {
                ...r,
                notes: [
                  ...r.notes,
                  {
                    id: `note-${Date.now().toString(36)}`,
                    at: new Date().toISOString(),
                    author: actorName,
                    body: body.trim(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
        audit: [auditEntry(actorName, "یادداشت داخلی", "request", id, body.slice(0, 90)), ...prev.audit],
      }));
      toast.success("یادداشت ثبت شد");
    },
    [actorName, toast],
  );

  const addAttachment = useCallback<StoreActions["addAttachment"]>(
    (id, attachment) => {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === id
            ? { ...r, attachments: [...r.attachments, attachment], updatedAt: new Date().toISOString() }
            : r,
        ),
        audit: [auditEntry(actorName, "بارگذاری مدرک", "attachment", attachment.id, attachment.name, "warning"), ...prev.audit],
      }));
    },
    [actorName],
  );

  const removeAttachment = useCallback<StoreActions["removeAttachment"]>(
    (id, attachmentId) => {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === id ? { ...r, attachments: r.attachments.filter((a) => a.id !== attachmentId) } : r,
        ),
        audit: [auditEntry(actorName, "حذف مدرک", "attachment", attachmentId, "مدرک از درخواست حذف شد", "warning"), ...prev.audit],
      }));
      toast.warning("مدرک حذف شد");
    },
    [actorName, toast],
  );

  const verifyAttachment = useCallback<StoreActions["verifyAttachment"]>(
    (id, attachmentId, verified) => {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === id
            ? {
                ...r,
                attachments: r.attachments.map((a) => (a.id === attachmentId ? { ...a, verified } : a)),
              }
            : r,
        ),
        audit: [
          auditEntry(actorName, verified ? "تأیید مدرک" : "لغو تأیید مدرک", "attachment", attachmentId, ""),
          ...prev.audit,
        ],
      }));
    },
    [actorName],
  );

  const deleteRequest = useCallback<StoreActions["deleteRequest"]>(
    (id) => {
      setState((prev) => {
        const target = prev.requests.find((r) => r.id === id);
        return {
          ...prev,
          requests: prev.requests.filter((r) => r.id !== id),
          notifications: prev.notifications.filter((n) => n.requestId !== id),
          audit: [
            auditEntry(actorName, "حذف درخواست", "request", id, target?.trackingCode ?? "", "critical"),
            ...prev.audit,
          ],
        };
      });
      toast.warning("درخواست حذف شد");
    },
    [actorName, toast],
  );

  const setRating = useCallback<StoreActions["setRating"]>((id, rating) => {
    setState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === id ? { ...r, rating } : r)),
    }));
  }, []);

  const rememberRequest = useCallback<StoreActions["rememberRequest"]>((code) => {
    setState((prev) => ({ ...prev, myRequests: Array.from(new Set([code, ...prev.myRequests])) }));
  }, []);

  const forgetRequest = useCallback<StoreActions["forgetRequest"]>((code) => {
    setState((prev) => ({ ...prev, myRequests: prev.myRequests.filter((c) => c !== code) }));
  }, []);

  const updateService = useCallback<StoreActions["updateService"]>(
    (slug, patch) => {
      setState((prev) => ({
        ...prev,
        services: prev.services.map((s) => (s.slug === slug ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)),
        audit: [auditEntry(actorName, "ویرایش خدمت", "service", slug, JSON.stringify(Object.keys(patch))), ...prev.audit],
      }));
      toast.success("تغییرات خدمت ذخیره شد");
    },
    [actorName, toast],
  );

  const saveFaq = useCallback<StoreActions["saveFaq"]>(
    (faq) => {
      setState((prev) => {
        const exists = prev.faqs.some((f) => f.id === faq.id);
        return {
          ...prev,
          faqs: exists ? prev.faqs.map((f) => (f.id === faq.id ? faq : f)) : [{ ...faq }, ...prev.faqs],
          audit: [auditEntry(actorName, exists ? "ویرایش پرسش" : "افزودن پرسش", "faq", faq.id, faq.question.slice(0, 60)), ...prev.audit],
        };
      });
      toast.success("پرسش متداول ذخیره شد");
    },
    [actorName, toast],
  );

  const deleteFaq = useCallback<StoreActions["deleteFaq"]>(
    (id) => {
      setState((prev) => ({
        ...prev,
        faqs: prev.faqs.filter((f) => f.id !== id),
        audit: [auditEntry(actorName, "حذف پرسش", "faq", id, "", "warning"), ...prev.audit],
      }));
      toast.warning("پرسش حذف شد");
    },
    [actorName, toast],
  );

  const saveArticle = useCallback<StoreActions["saveArticle"]>(
    (article) => {
      setState((prev) => {
        const exists = prev.articles.some((a) => a.id === article.id);
        return {
          ...prev,
          articles: exists ? prev.articles.map((a) => (a.id === article.id ? article : a)) : [article, ...prev.articles],
          audit: [
            auditEntry(actorName, exists ? "ویرایش مقاله" : "افزودن مقاله", "article", article.id, article.title.slice(0, 60)),
            ...prev.audit,
          ],
        };
      });
      toast.success("مقاله ذخیره شد");
    },
    [actorName, toast],
  );

  const deleteArticle = useCallback<StoreActions["deleteArticle"]>(
    (id) => {
      setState((prev) => ({
        ...prev,
        articles: prev.articles.filter((a) => a.id !== id),
        audit: [auditEntry(actorName, "حذف مقاله", "article", id, "", "warning"), ...prev.audit],
      }));
      toast.warning("مقاله حذف شد");
    },
    [actorName, toast],
  );

  const saveAnnouncement = useCallback<StoreActions["saveAnnouncement"]>(
    (item) => {
      setState((prev) => {
        const exists = prev.announcements.some((a) => a.id === item.id);
        return {
          ...prev,
          announcements: exists
            ? prev.announcements.map((a) => (a.id === item.id ? item : a))
            : [item, ...prev.announcements],
          audit: [auditEntry(actorName, exists ? "ویرایش اطلاعیه" : "افزودن اطلاعیه", "announcement", item.id, item.title), ...prev.audit],
        };
      });
      toast.success("اطلاعیه ذخیره شد");
    },
    [actorName, toast],
  );

  const deleteAnnouncement = useCallback<StoreActions["deleteAnnouncement"]>(
    (id) => {
      setState((prev) => ({
        ...prev,
        announcements: prev.announcements.filter((a) => a.id !== id),
        audit: [auditEntry(actorName, "حذف اطلاعیه", "announcement", id, "", "warning"), ...prev.audit],
      }));
      toast.warning("اطلاعیه حذف شد");
    },
    [actorName, toast],
  );

  const saveUser = useCallback<StoreActions["saveUser"]>(
    (user) => {
      setState((prev) => {
        const exists = prev.users.some((u) => u.id === user.id);
        return {
          ...prev,
          users: exists ? prev.users.map((u) => (u.id === user.id ? user : u)) : [...prev.users, user],
          audit: [auditEntry(actorName, exists ? "ویرایش کاربر" : "افزودن کاربر", "user", user.id, `${user.name} — ${user.role}`), ...prev.audit],
        };
      });
      toast.success("کاربر ذخیره شد");
    },
    [actorName, toast],
  );

  const deleteUser = useCallback<StoreActions["deleteUser"]>(
    (id) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
        audit: [auditEntry(actorName, "حذف کاربر", "user", id, "", "critical"), ...prev.audit],
      }));
      toast.warning("کاربر حذف شد");
    },
    [actorName, toast],
  );

  const saveSettings = useCallback<StoreActions["saveSettings"]>(
    (patch) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
        audit: [auditEntry(actorName, "تغییر تنظیمات", "settings", Object.keys(patch).join(","), "", "warning"), ...prev.audit],
      }));
      toast.success("تنظیمات ذخیره شد");
    },
    [actorName, toast],
  );

  const retryNotification = useCallback<StoreActions["retryNotification"]>(
    (id) => {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id && n.status !== "sent"
            ? {
                ...n,
                status: "sent",
                attempts: n.attempts + 1,
                sentAt: new Date().toISOString(),
                error: null,
              }
            : n,
        ),
        audit: [auditEntry(actorName, "ارسال مجدد اعلان", "notification", id, ""), ...prev.audit],
      }));
      toast.success("اعلان با موفقیت ارسال شد");
    },
    [actorName, toast],
  );

  const sendTestNotification = useCallback<StoreActions["sendTestNotification"]>(
    (channel) => {
      const nowIso = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        notifications: [
          {
            id: `ntf-${Date.now().toString(36)}-t`,
            channel,
            recipient: channel === "email" ? prev.settings.email : prev.settings.phone1,
            subject: "پیام آزمایشی سامانه",
            body: "این پیام آزمایشی برای بررسی درستی تنظیمات کانال ارتباطی ارسال شد.",
            status: "sent",
            attempts: 1,
            requestId: null,
            trackingCode: null,
            createdAt: nowIso,
            sentAt: nowIso,
            error: null,
          },
          ...prev.notifications,
        ],
        audit: [auditEntry(actorName, "ارسال پیام آزمایشی", "notification", channel, ""), ...prev.audit],
      }));
      toast.success("پیام آزمایشی ارسال شد", `کانال: ${channel}`);
    },
    [actorName, toast],
  );

  const login = useCallback<StoreActions["login"]>(
    (email, password) => {
      const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) return { ok: false, message: "کاربری با این ایمیل یافت نشد." };
      if (!user.active) return { ok: false, message: "این حساب کاربری غیرفعال است." };
      if (password !== DEMO_CREDENTIALS.password) return { ok: false, message: "رمز عبور نادرست است." };
      setState((prev) => ({
        ...prev,
        session: { userId: user.id, at: new Date().toISOString() },
        users: prev.users.map((u) => (u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u)),
        audit: [auditEntry(user.name, "ورود به پیشخوان", "session", user.id, "ورود موفق"), ...prev.audit],
      }));
      return { ok: true, message: `خوش آمدید، ${user.name}` };
    },
    [state.users],
  );

  const logout = useCallback<StoreActions["logout"]>(() => {
    setState((prev) => ({
      ...prev,
      session: null,
      audit: prev.audit,
    }));
  }, []);

  const resetDemo = useCallback<StoreActions["resetDemo"]>(() => {
    setState(buildSeed(new Date()));
    toast.info("داده‌های نمایشی بازنشانی شد");
  }, [toast]);

  const exportJson = useCallback<StoreActions["exportJson"]>(() => JSON.stringify(state, null, 2), [state]);

  const requestByCode = useCallback(
    (code: string) => state.requests.find((r) => r.trackingCode.toUpperCase() === code.trim().toUpperCase()),
    [state.requests],
  );

  const myRequestList = useMemo(
    () =>
      state.myRequests
        .map((code) => state.requests.find((r) => r.trackingCode === code))
        .filter((r): r is RequestRecord => Boolean(r)),
    [state.myRequests, state.requests],
  );

  const serviceBySlug = useCallback(
    (slug: string) => state.services.find((s) => s.slug === slug),
    [state.services],
  );

  const activeAnnouncements = useMemo(() => state.announcements.filter((a) => a.active), [state.announcements]);

  const value: StoreValue = {
    state,
    ready,
    stats,
    currentUser,
    role,
    activeAnnouncements,
    requestByCode,
    myRequestList,
    serviceBySlug,
    can,
    addRequest,
    updateRequest,
    changeStatus,
    addNote,
    addAttachment,
    removeAttachment,
    verifyAttachment,
    deleteRequest,
    setRating,
    rememberRequest,
    forgetRequest,
    updateService,
    saveFaq,
    deleteFaq,
    saveArticle,
    deleteArticle,
    saveAnnouncement,
    deleteAnnouncement,
    saveUser,
    deleteUser,
    saveSettings,
    retryNotification,
    sendTestNotification,
    login,
    logout,
    resetDemo,
    exportJson,
    toast,
    toasts,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** دسترسی سریع به اعلان‌های کوچک بدون بارگذاری کل فروشگاه */
export function useToast(): ToastApi {
  return useStore().toast;
}
