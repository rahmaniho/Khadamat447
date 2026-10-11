/**
 * آزمون‌های واحد سامانه (بدون وابستگی به سرور و پایگاه داده)
 * اجرا: npm test
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  en,
  fa,
  faBytes,
  faDuration,
  faNumber,
  formatDate,
  g2j,
  isMobile,
  isPhone,
  maskPhone,
  normalizeFa,
  normalizePhone,
  phoneLast4,
  readingTime,
  stripMarkdown,
  timeAgo,
  truncateText,
} from "../src/lib/format";
import { ARTICLES, FAQS, SERVICES, getArticle, getRelatedArticles, getService, searchFullText } from "../src/lib/content";
import { SERVICES_SEED, FIELDS_SEED } from "../src/lib/content/catalog";
import { SITE, SERVICE_UI, NAV } from "../src/lib/content/site";
import {
  DEMO_CREDENTIALS,
  buildSeed,
  buildStats,
  codeFromIndex,
  randomTrackingCode,
} from "../src/lib/store/seed";
import { PERMISSIONS } from "../src/lib/store/store";
import { STATUS_META, STATUS_ORDER } from "../src/lib/store/types";

/* ------------------------------ اعداد و متن ------------------------------ */

test("تبدیل ارقام فارسی و لاتین", () => {
  assert.equal(fa(1404), "۱۴۰۴");
  assert.equal(en("۱۴۰۴/۰۷/۱۹"), "1404/07/19");
  assert.equal(faNumber(1234567), "۱٬۲۳۴٬۵۶۷");
  assert.equal(faNumber(1234.5, 1), "۱٬۲۳۴.۵");
  assert.equal(faBytes(5 * 1024 * 1024), "۵.۰ مگابایت");
});

test("نرمال‌سازی متن فارسی برای جست‌وجو", () => {
  assert.equal(normalizeFa("کارت  بهداشتِي"), normalizeFa("کارت بهداشتی"));
  assert.equal(normalizeFa("آموزش‌ها، کارت!"), "اموزشها کارت");
  assert.equal(normalizeFa("كارت بهداشت"), normalizeFa("کارت بهداشت"));
  assert.ok(normalizeFa("کد پیگیری").includes("پیگیری"));
});

test("حذف مارک‌داون و شمارش زمان مطالعه", () => {
  const md = "## سرتیتر\n\n- **مورد** اول\n- مورد دوم\n\n> نقل‌قول مهم";
  assert.equal(stripMarkdown(md), "سرتیتر مورد اول مورد دوم نقل‌قول مهم");
  const rt = readingTime("واژه ".repeat(380));
  assert.equal(rt.minutes, 2);
});

test("کوتاه‌سازی متن", () => {
  assert.equal(truncateText("الف ب پ ت ث", 5), "الف…");
  assert.equal(truncateText("کوتاه", 20), "کوتاه");
});

/* -------------------------------- تاریخ -------------------------------- */

test("تبدیل تاریخ میلادی به شمسی", () => {
  assert.deepEqual(g2j(2025, 10, 11), [1404, 7, 19]);
  assert.deepEqual(g2j(2024, 3, 20), [1403, 1, 1]);
  assert.equal(formatDate("2025-10-11T09:30:00.000Z", "medium"), "۱۹ مهر ۱۴۰۴");
  assert.equal(formatDate("2025-10-11T09:30:00.000Z", "time").length > 0, true);
  assert.equal(formatDate(null), "—");
});

test("زمان نسبی", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(timeAgo("2026-01-01T09:00:00.000Z", now), "۳ ساعت پیش");
  assert.equal(timeAgo("2025-12-31T12:00:00.000Z", now), "۱ روز پیش");
  assert.equal(timeAgo("2026-01-01T11:59:40.000Z", now), "همین حالا");
  assert.equal(faDuration(2 * 86_400_000 + 3 * 3_600_000), "۲ روز و ۳ ساعت");
});

/* ------------------------------- تماس‌ها ------------------------------- */

test("نرمال‌سازی و اعتبارسنجی شماره تماس", () => {
  assert.equal(normalizePhone("+98 912 123 4567"), "09121234567");
  assert.equal(normalizePhone("۰۹۳۹-۸۵۲-۰۱۵۰"), "09398520150");
  assert.equal(isMobile("09121234567"), true);
  assert.equal(isMobile("02833992550"), false);
  assert.equal(isPhone("02833992550"), true);
  assert.equal(phoneLast4("09121234567"), "4567");
  assert.equal(maskPhone("09121234567"), "۰۹۱۲****۵۶۷");
});

/* ------------------------------- محتوا -------------------------------- */

test("ساختار خدمات، پرسش‌ها و مقالات", () => {
  assert.equal(SERVICES.length, SERVICES_SEED.length);
  assert.equal(SERVICES.length >= 5, true);
  for (const service of SERVICES) {
    assert.ok(service.title.length > 5, `عنوان خدمت ${service.slug} ناقص است`);
    assert.ok(service.fields.length > 0, `خدمت ${service.slug} فیلد اختصاصی ندارد`);
    assert.ok(SERVICE_UI[service.slug], `اطلاعات ظاهری خدمت ${service.slug} تعریف نشده است`);
    assert.ok(getService(service.slug)?.slug === service.slug);
  }
  assert.equal(FAQS.length, 9);
  assert.ok(ARTICLES.length >= 13, "تعداد مقالات کمتر از انتظار است");
  assert.equal(new Set(ARTICLES.map((a) => a.slug)).size, ARTICLES.length, "اسلاگ مقاله‌ها تکراری است");
  assert.ok(getArticle("health-card-what-is-who-needs"));
  assert.equal(getRelatedArticles("health-card-what-is-who-needs").length, 3);
});

test("فیلدهای فرم هر خدمت مطابق seed است", () => {
  const totalFields = SERVICES.reduce((sum, s) => sum + s.fields.length, 0);
  assert.equal(totalFields, FIELDS_SEED.length);
  for (const field of FIELDS_SEED) {
    assert.ok(SERVICES.some((s) => s.slug === field.service), `خدمت ${field.service} برای فیلد وجود ندارد`);
  }
});

test("جست‌وجوی متن کامل", () => {
  const results = searchFullText("کارت بهداشت");
  assert.ok(results.total > 0, "نتیجه‌ای برای کارت بهداشت یافت نشد");
  assert.ok(results.groups.service.length > 0, "خدمت مرتبط پیدا نشد");
  const empty = searchFullText("ا");
  assert.equal(empty.total, 0, "کوئری کوتاه نباید نتیجه بدهد");
});

test("اطلاعات تماس دفتر در محتوا صحیح است", () => {
  assert.equal(SITE.city, "قزوین");
  assert.ok(SITE.phones.some((p) => p.value === "09398520150"));
  assert.ok(SITE.phones.some((p) => p.value === "02833992550"));
  assert.ok(SITE.email.toLowerCase().includes("khadamat447"));
  assert.ok(NAV.some((item) => item.href === "/request"));
});

/* -------------------------------- فروشگاه -------------------------------- */

test("کد پیگیری یکتا و با قالب درست تولید می‌شود", () => {
  const code = randomTrackingCode();
  assert.match(code, /^K447-[A-Z2-9]{5}-[A-Z2-9]{5}$/);
  const codes = new Set(Array.from({ length: 300 }, (_, i) => codeFromIndex(i)));
  assert.equal(codes.size, 300, "کدهای تولیدشده تکراری هستند");
});

test("داده اولیه نمایشی ساختار درستی دارد", () => {
  const state = buildSeed(new Date("2026-10-11T06:30:00.000Z"));
  assert.ok(state.requests.length >= 25, "تعداد درخواست‌های نمایشی کم است");
  assert.equal(state.services.length, SERVICES.length);
  assert.ok(state.users.some((u) => u.role === "owner"));
  assert.equal(state.session?.userId, "usr-0001");

  for (const request of state.requests) {
    assert.match(request.trackingCode, /^K447-[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    assert.ok(STATUS_META[request.status], `وضعیت نامعتبر: ${request.status}`);
    assert.ok(request.timeline.length >= 1, "هر درخواست باید حداقل یک رویداد داشته باشد");
    assert.ok(request.answers.length > 0, "پاسخ‌های فرم خدمت خالی است");
  }
  assert.equal(new Set(state.requests.map((r) => r.trackingCode)).size, state.requests.length);
});

test("آمار پیشخوان درست محاسبه می‌شود", () => {
  const now = new Date("2026-10-11T06:30:00.000Z");
  const state = buildSeed(now);
  const stats = buildStats(state, now);
  assert.equal(stats.total, state.requests.length);
  const byStatusSum = STATUS_ORDER.reduce((sum, key) => sum + stats.byStatus[key], 0) + stats.byStatus.rejected;
  assert.equal(byStatusSum, stats.total, "جمع وضعیت‌ها با کل درخواست‌ها برابر نیست");
  assert.equal(stats.last7Days.length, 7);
  assert.ok(stats.byService.length === state.services.length);
  assert.ok(stats.completionRate >= 0 && stats.completionRate <= 100);
  assert.ok(stats.satisfaction !== null && stats.satisfaction >= 1 && stats.satisfaction <= 5);
});

test("اعلان‌ها و سابقه رویداد برای درخواست‌ها ساخته می‌شود", () => {
  const state = buildSeed(new Date("2026-10-11T06:30:00.000Z"));
  assert.ok(state.notifications.length > 10);
  assert.ok(state.notifications.some((n) => n.status === "failed"));
  assert.ok(state.audit.length >= 5);
  assert.ok(state.announcements.some((a) => a.active));
});

/* ------------------------------- دسترسی‌ها ------------------------------- */

test("ماتریس دسترسی نقش‌ها منطقی است", () => {
  assert.ok(PERMISSIONS.owner.includes("users.manage"));
  assert.ok(!PERMISSIONS.reviewer.includes("users.manage"));
  assert.ok(!PERMISSIONS.content.includes("requests.manage"));
  assert.ok(PERMISSIONS.support.includes("requests.view"));
  assert.equal(DEMO_CREDENTIALS.password.length >= 6, true);
});

/* --------------------------------- قواعد --------------------------------- */

test("همه خدمات فعال حداقل یک مقدار نمایشی دارند", () => {
  for (const service of SERVICES) {
    assert.ok(service.highlights.length >= 3, `خدمت ${service.slug} نکته کلیدی ندارد`);
    assert.ok(service.documentsCount > 0 || /other/.test(service.slug), `فهرست مدارک ${service.slug} خالی است`);
  }
});
