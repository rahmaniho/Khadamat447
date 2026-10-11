/**
 * آزمون‌های واحد سامانه (بدون وابستگی به سرور و پایگاه داده)
 * اجرا: npm test
 */
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

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
import { STATIC_BASE_PATH, activeBasePath, isStaticExport } from "../src/lib/basepath";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "../src/lib/theme";
import { buildLlmsText } from "../src/lib/content/llms";
import { itemListJsonLd, organizationJsonLd, websiteJsonLd } from "../src/lib/seo";
import robotsDefault, { AI_CRAWLERS, disallowedPaths } from "../src/app/robots";

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

/* ------------------------------- basePath -------------------------------- */

test("basePath فقط در حالت خروجی استاتیک فعال می‌شود", () => {
  const previous = process.env.STATIC_EXPORT;
  try {
    delete process.env.STATIC_EXPORT;
    assert.equal(activeBasePath(), "");
    assert.equal(isStaticExport(), false);

    process.env.STATIC_EXPORT = "false";
    assert.equal(activeBasePath(), "");

    process.env.STATIC_EXPORT = "true";
    assert.equal(activeBasePath(), STATIC_BASE_PATH);
    assert.equal(isStaticExport(), true);
    assert.ok(STATIC_BASE_PATH.startsWith("/"), "مسیر پایه باید مطلق باشد");
  } finally {
    if (previous === undefined) delete process.env.STATIC_EXPORT;
    else process.env.STATIC_EXPORT = previous;
  }
});

/* ---------------------------------- تم ----------------------------------- */

test("اسکریپت ضد‌پرش تم معتبر و هم‌خوان با کلید ذخیره‌سازی است", () => {
  // باید پیش از رنگ‌آمیزی اجرا شود؛ پس نحو آن باید بی‌نقص باشد
  assert.doesNotThrow(() => new vm.Script(THEME_INIT_SCRIPT));
  assert.ok(THEME_INIT_SCRIPT.includes(THEME_STORAGE_KEY), "کلید ذخیره‌سازی تم در اسکریپت نیست");
  assert.ok(/classList\.toggle\("dark"/.test(THEME_INIT_SCRIPT), "کلاس dark اعمال نمی‌شود");
});

test("اسکریپت تم حالت ذخیره‌شده را بر تنظیم سیستم مقدم می‌داند", () => {
  const run = (stored: string | null, prefersDark: boolean): boolean => {
    const root = { classList: { toggle: (_c: string, on: boolean) => (applied = on) }, style: {} as Record<string, string> };
    let applied = false;
    const context = {
      localStorage: { getItem: () => stored },
      window: { matchMedia: () => ({ matches: prefersDark }) },
      document: { documentElement: root },
    };
    vm.createContext(context);
    new vm.Script(THEME_INIT_SCRIPT).runInContext(context);
    return applied;
  };

  assert.equal(run("dark", false), true, "حالت تاریک ذخیره‌شده باید اعمال شود");
  assert.equal(run("light", true), false, "حالت روشن ذخیره‌شده باید بر تنظیم سیستم مقدم باشد");
  assert.equal(run(null, true), true, "بدون مقدار ذخیره‌شده، تنظیم سیستم حاکم است");
  assert.equal(run(null, false), false);
  // مقدار نامعتبر در حافظه نباید خطا بدهد و باید به تنظیم سیستم برگردد
  assert.equal(run("bogus", true), true);
  assert.equal(run("bogus", false), false);
});

/* ------------------------------ سئو و جئو (GEO) ------------------------------ */

test("llms.txt با منبع یکتای محتوا ساخته می‌شود و ساختار استاندارد دارد", () => {
  const text = buildLlmsText();
  assert.ok(text.startsWith(`# ${SITE.name}`), "باید با عنوان سطح یک شروع شود");
  assert.ok(text.includes(">"), "باید خلاصه نقل‌قولی داشته باشد");
  // اطلاعات تماس واقعی دفتر
  assert.ok(text.includes(SITE.email), "ایمیل دفتر در llms.txt نیست");
  assert.ok(
    text.includes(`+98${SITE.phones[0].value.replace(/^0/, "")}`),
    "شماره تماس بین‌المللی در llms.txt نیست",
  );
  assert.ok(text.includes(SITE.addressFull), "نشانی در llms.txt نیست");
  assert.ok(text.includes(`${SITE.lat}, ${SITE.lng}`), "مختصات جغرافیایی در llms.txt نیست");
  // همه خدمات با پیوند مطلق
  for (const service of SERVICES) {
    assert.ok(text.includes(service.title), `خدمت ${service.slug} در llms.txt نیست`);
    assert.ok(text.includes(`/services/${service.slug}`), `پیوند خدمت ${service.slug} نیست`);
  }
  // همه مقاله‌ها
  for (const article of ARTICLES) {
    assert.ok(text.includes(`/articles/${article.slug}`), `پیوند مقاله ${article.slug} نیست`);
  }
  // خروجی Markdown خالص است، نه HTML
  assert.ok(!/<[a-z]/i.test(text), "llms.txt نباید برچسب HTML داشته باشد");
  // همه پیوندها مطلق هستند تا موتورهای مولد بتوانند آن‌ها را دنبال کنند
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    assert.ok(/^https?:\/\//.test(match[1]), `پیوند نسبی در llms.txt: ${match[1]}`);
  }
});

test("داده ساختاریافته سازمان با فیلدهای محلی و GEO کامل است", () => {
  const org = organizationJsonLd();
  assert.equal(org.geo.latitude, SITE.lat);
  assert.equal(org.geo.longitude, SITE.lng);
  assert.equal(org.hasMap, SITE.mapProfileUrl);
  assert.ok(org.sameAs.length >= SITE.social.length, "sameAs باید شبکه‌های اجتماعی را پوشش دهد");
  // ساعات کاری ماشین‌خوان
  const specs = org.openingHoursSpecification as Array<{ dayOfWeek: string[]; opens: string; closes: string }>;
  assert.equal(specs.length, SITE.hoursSpecification.length);
  const allDays = specs.flatMap((s) => s.dayOfWeek);
  for (const day of SITE.hoursSpecification.flatMap((s) => s.days)) {
    assert.ok(allDays.includes(`https://schema.org/${day}`), `روز ${day} در ساعات کاری نیست`);
  }
  // کاتالوگ خدمات
  const offers = (org.hasOfferCatalog as { itemListElement: unknown[] }).itemListElement;
  assert.equal(offers.length, SERVICES.length, "کاتالوگ باید همه خدمات را داشته باشد");
  // JSON معتبر و بدون کاراکتر خطرناک برای <script>
  const json = JSON.stringify(org);
  assert.doesNotThrow(() => JSON.parse(json));
  assert.ok(!json.includes("<"), "JSON-LD نباید «<» خام داشته باشد");
});

test("وب‌سایت و ItemList ساختاریافته معتبر است", () => {
  const site = websiteJsonLd();
  assert.ok(site.potentialAction, "SearchAction برای جست‌وجوی سایت لازم است");
  const list = itemListJsonLd({
    name: "فهرست آزمایشی",
    path: "/services",
    items: [
      { name: "الف", href: "/services/a", description: "توضیح الف" },
      { name: "ب", href: "/services/b" },
    ],
  });
  assert.equal(list.numberOfItems, 2);
  const items = list.itemListElement as Array<{ position: number; url: string; description?: string }>;
  assert.deepEqual(items.map((i) => i.position), [1, 2], "position باید از ۱ شروع شود");
  assert.ok(items.every((i) => /^https?:\/\//.test(i.url)), "پیوندها باید مطلق باشند");
  assert.equal(items[0].description, "توضیح الف");
  assert.equal(items[1].description, undefined);
});

test("robots.txt خزنده‌های هوش مصنوعی را با همان حریم خصوصی پوشش می‌دهد", () => {
  const config = robotsDefault();
  assert.ok(Array.isArray(config.rules) && config.rules.length === 2);
  const aiRule = config.rules[1];
  assert.deepEqual(aiRule.userAgent, AI_CRAWLERS);
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    assert.ok(AI_CRAWLERS.includes(bot), `${bot} در فهرست خزنده‌های مجاز نیست`);
  }
  // قاعده عمومی و قاعده هوش مصنوعی باید Disallow یکسان داشته باشند
  assert.deepEqual(aiRule.disallow, config.rules[0].disallow);

  // در حالت استاتیک، مسیرهای مسدود پیشوند basePath می‌گیرند
  const prefixed = disallowedPaths(STATIC_BASE_PATH);
  assert.ok(prefixed.includes(`${STATIC_BASE_PATH}/admin`));
  assert.ok(prefixed.every((p) => p.startsWith(STATIC_BASE_PATH)));
  // در حالت عادی بدون پیشوند
  const plain = disallowedPaths("");
  assert.ok(plain.includes("/admin") && plain.includes("/track"));
});
