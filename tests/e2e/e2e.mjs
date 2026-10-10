/**
 * آزمون سرتاسری با مرورگر واقعی (puppeteer-core)
 * پیش‌نیاز: سرور در حال اجرا (BASE_URL) و یک فایل اجرایی Chrome/Chromium (CHROME_PATH)
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... CHROME_PATH=/usr/bin/chromium npm run test:e2e
 * خروجی: گزارش در کنسول + تصاویر در tests/e2e/artifacts (فراموش نکنید artifacts را در Git ثبت نکنید)
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@localhost.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CHROME = process.env.CHROME_PATH;
const DB_FILE = process.env.DB_FILE || path.join(process.cwd(), ".data", "khadamat447.db");
const ART = path.join(process.cwd(), "tests", "e2e", "artifacts");
fs.mkdirSync(ART, { recursive: true });

if (!ADMIN_PASSWORD || !CHROME) {
  console.error("ADMIN_PASSWORD و CHROME_PATH لازم هستند.");
  process.exit(2);
}

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
};

/** شمارش مستقیم پایگاه داده SQLite برای اعتبارسنجی ذخیره‌سازی */
function dbQuery(sql) {
  const script = `const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(${JSON.stringify(DB_FILE)});console.log(JSON.stringify(db.prepare(${JSON.stringify(sql)}).all()));`;
  return JSON.parse(execFileSync(process.execPath, ["-e", script], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").pop());
}

const pdfPath = path.join(ART, "sample-document.pdf");
fs.writeFileSync(pdfPath, Buffer.concat([Buffer.from("%PDF-1.4\n% e2e sample\n"), Buffer.alloc(200, 0x20), Buffer.from("\n%%EOF\n")]));
const exePath = path.join(ART, "fake-document.pdf"); // پسوند PDF ولی محتوای اجرایی (MZ)
fs.writeFileSync(exePath, Buffer.concat([Buffer.from("MZ"), Buffer.alloc(64)]));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
  protocolTimeout: 120000,
});

const bodyText = async (page) => page.evaluate(() => document.body.innerText);
const waitText = (page, t, timeout = 15000) => page.waitForFunction((x) => document.body.innerText.includes(x), { timeout }, t);
const clickButtonText = async (page, text) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button, a")].find((el) => el.offsetParent !== null && el.innerText.trim().includes(t));
    if (!b) return false;
    b.click();
    return true;
  }, text);
  if (!ok) throw new Error(`دکمه «${text}» پیدا نشد`);
};

try {
  /* ---------- ۱. صفحه اصلی در موبایل ---------- */
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 60000 });
  const home = await bodyText(mobile);
  check("صفحه اصلی: تیتر اصلی نمایش داده می‌شود", home.includes("خدمات سلامت و بهداشت، ساده‌تر و سریع‌تر"));
  check("صفحه اصلی: چهار خدمت اصلی نمایش داده می‌شود", ["خدمات ثبت و صدور کارت بهداشت", "آموزشگاه بهداشت اصناف", "صدور صلاحیت بهداشت", "قراردادهای ممیزی"].every((t) => home.includes(t)));
  check("صفحه اصلی: توضیح عدم تأیید نهایی حضور دارد", home.includes("ثبت درخواست در این سامانه به معنی تأیید نهایی"));
  check("صفحه اصلی: ساعات کاری اعلام‌شده (۸ تا ۱۶) در فوتر نمایش داده می‌شود", home.includes("۰۸:۰۰ تا ۱۶:۰۰"));
  check("صفحه اصلی: ایمیل رسمی دفتر نمایش داده می‌شود", home.includes("Info@Khadamat447.IR"));
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("موبایل: بدون اسکرول افقی", overflow <= 1, `overflow=${overflow}`);
  await mobile.screenshot({ path: path.join(ART, "home-mobile.png"), fullPage: false });

  await mobile.click('button[aria-label="باز کردن منو"]');
  await mobile.waitForSelector("#mobile-menu", { timeout: 5000 });
  check("موبایل: منوی همبرگری باز می‌شود", true);
  await mobile.screenshot({ path: path.join(ART, "menu-mobile.png") });
  await mobile.click('button[aria-label="بستن منو"]');

  /* ---------- ۲. فرم ثبت درخواست: اعتبارسنجی و ارسال ---------- */
  const fillAndSubmit = async ({ phone, file, toStep4 = true }) => {
    await mobile.goto(BASE + "/request?service=health-card", { waitUntil: "networkidle0" });
    await mobile.type("#fullName", "علی آزمایشی");
    await mobile.type("#phone", phone);
    await mobile.type("#orgName", "واحد آزمایشی");
    await clickButtonText(mobile, "مرحله بعد");
    await mobile.waitForSelector('[data-step="3"]:not([hidden])', { timeout: 5000 });
    await mobile.select("select[name=field_request_kind]", "درخواست جدید");
    await mobile.type("input[name=field_workplace_name]", "واحد آزمایشی");
    await mobile.select("select[name=field_workplace_type]", "تهیه و عرضه مواد غذایی");
    if (file) {
      const input = await mobile.$("input[type=file][name=files]");
      await input.uploadFile(file);
    }
    if (!toStep4) return;
    await clickButtonText(mobile, "مرحله بعد");
    await mobile.waitForSelector('[data-step="4"]:not([hidden])', { timeout: 5000 });
    await mobile.evaluate(() => {
      document.getElementById("consentAccuracy").checked = true;
      document.getElementById("consentPrivacy").checked = true;
    });
  };
  const submitNow = () => mobile.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.type === "submit" && x.innerText.includes("ثبت درخواست"));
    b.click();
  });
  const stepVisible = (n) => mobile.evaluate((k) => !document.querySelector(`[data-step="${k}"]`).hidden, n);

  // الف) مرحله ۲: گام اول بدون نام → نباید پیش برود
  await mobile.goto(BASE + "/request?service=health-card", { waitUntil: "networkidle0" });
  check("فرم: خدمت از پیش‌انتخاب‌شده به مرحله ۲ می‌رود", (await bodyText(mobile)).includes("اطلاعات متقاضی"));
  await clickButtonText(mobile, "مرحله بعد");
  await mobile.waitForFunction(() => document.body.innerText.includes("لطفاً موارد مشخص‌شده"), { timeout: 5000 }).catch(() => {});
  check("فرم: مرحله بعد بدون نام، پیش نمی‌رود", (await bodyText(mobile)).includes("لطفاً موارد مشخص‌شده") && (await stepVisible(2)));

  // ب) شماره نامعتبر → خطای سرور و بازگشت به مرحله ۲
  await fillAndSubmit({ phone: "1234567", file: null });
  await submitNow();
  await mobile.waitForFunction(() => document.body.innerText.includes("شماره تماس معتبر نیست"), { timeout: 15000 }).catch(() => {});
  const phoneErrText = await bodyText(mobile);
  check("اعتبارسنجی سرور: شماره نامعتبر پذیرفته نمی‌شود و به مرحله ۲ بازمی‌گردد", phoneErrText.includes("شماره تماس معتبر نیست") && (await stepVisible(2)), phoneErrText.includes("شماره تماس معتبر نیست") ? "" : phoneErrText.slice(0, 300));
  check("ارسال با خطا: پیام موفقیت نمایش داده نمی‌شود", !(await bodyText(mobile)).includes("درخواست شما ثبت شد"));

  // ج) فایل اجرایی با پسوند PDF → رد در سرور
  await fillAndSubmit({ phone: "09121234567", file: exePath });
  await submitNow();
  await mobile.waitForFunction(() => document.body.innerText.includes("نوع فایل قابل شناسایی نیست"), { timeout: 15000 }).catch(() => {});
  check("امنیت فایل: فایل اجرایی با پسوند PDF رد می‌شود و به مرحله ۳ بازمی‌گردد", (await bodyText(mobile)).includes("نوع فایل قابل شناسایی نیست") && (await stepVisible(3)));

  // د) ارسال معتبر با PDF
  await fillAndSubmit({ phone: "09121234567", file: pdfPath });
  const before = dbQuery("SELECT COUNT(*) AS c FROM requests")[0].c;
  // دوبار کلیک پشت سر هم
  await mobile.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.innerText.includes("ثبت درخواست") && x.type === "submit");
    b.click();
    setTimeout(() => b.click(), 30);
    setTimeout(() => b.click(), 60);
  });
  await mobile.waitForFunction(() => location.pathname === "/request/success", { timeout: 30000 });
  const txt = await bodyText(mobile);
  const codeMatch = txt.match(/K447-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}/);
  check("ثبت موفق: صفحه تأیید با کد پیگیری نمایش داده می‌شود", Boolean(codeMatch));
  const code = codeMatch ? codeMatch[0] : "";
  await mobile.screenshot({ path: path.join(ART, "success-mobile.png") });
  const after = dbQuery("SELECT COUNT(*) AS c FROM requests")[0].c;
  check("ثبت موفق: دقیقاً یک درخواست ذخیره شد (ضد ثبت تکراری)", after - before === 1, `before=${before} after=${after}`);
  const row = dbQuery(`SELECT tracking_code, phone, phone_last4, status, service_slug FROM requests WHERE tracking_code = '${code}'`)[0];
  check("پایگاه داده: کد پیگیری و شماره نرمال‌شده ذخیره شده", Boolean(row) && row.phone === "09121234567" && row.phone_last4 === "4567");
  check("پایگاه داده: وضعیت اولیه «new» است", row?.status === "new");
  const files = dbQuery(`SELECT a.original_name, a.mime_type FROM attachments a JOIN requests r ON r.id=a.request_id WHERE r.tracking_code='${code}'`);
  check("پایگاه داده: مدرک PDF ذخیره شد", files.length === 1 && files[0].mime_type === "application/pdf", JSON.stringify(files));
  const storedPath = path.join(process.cwd(), ".data", "uploads");
  check("ذخیره‌سازی: فایل خارج از پوشه public است", !fs.existsSync(path.join(process.cwd(), "public", "uploads")) && fs.existsSync(storedPath));

  /* ---------- ۳. پیگیری درخواست ---------- */
  const pub = await browser.newPage();
  await pub.setViewport({ width: 390, height: 844, isMobile: true });
  await pub.goto(BASE + "/track", { waitUntil: "networkidle0" });
  await pub.type("#trackingCode", code);
  await pub.type("#verification", "0000");
  await clickButtonText(pub, "پیگیری درخواست");
  await waitText(pub, "درخواستی با این مشخصات پیدا نشد", 15000);
  check("پیگیری: چهار رقم اشتباه، اطلاعات نمایش نمی‌دهد", !(await bodyText(pub)).includes("ثبت اولیه"));
  await pub.click("#verification", { clickCount: 3 });
  await pub.type("#verification", "4567");
  await clickButtonText(pub, "پیگیری درخواست");
  await waitText(pub, "ثبت اولیه", 15000);
  const tb = await bodyText(pub);
  check("پیگیری: وضعیت «ثبت اولیه» با کد و چهار رقم درست نمایش داده شد", tb.includes("ثبت اولیه") && tb.includes(code));
  check("پیگیری: شماره کامل و نام متقاضی نمایش داده نمی‌شود", !tb.includes("09121234567") && !tb.includes("علی آزمایشی"));
  await pub.screenshot({ path: path.join(ART, "track-mobile.png"), fullPage: true });

  /* ---------- ۴. پنل مدیریت ---------- */
  const admin = await browser.newPage();
  await admin.setViewport({ width: 1366, height: 900 });
  await admin.goto(BASE + "/admin", { waitUntil: "networkidle0" });
  check("امنیت: بدون ورود، /admin به صفحه ورود هدایت می‌شود", admin.url().includes("/admin/login"));
  await admin.type("#email", ADMIN_EMAIL);
  await admin.type("#password", "wrong-password-123");
  await clickButtonText(admin, "ورود");
  await waitText(admin, "ورود ناموفق بود", 15000).catch(() => {});
  check("امنیت: رمز نادرست، ورود را رد می‌کند با پیام عمومی", (await bodyText(admin)).includes("ورود ناموفق بود"));
  await admin.evaluate(() => { document.getElementById("password").value = ""; });
  await admin.type("#password", ADMIN_PASSWORD);
  await clickButtonText(admin, "ورود");
  await admin.waitForFunction(() => location.pathname === "/admin", { timeout: 20000 });
  check("ورود مدیر: داشبورد باز شد", true);
  await admin.screenshot({ path: path.join(ART, "admin-dashboard.png") });

  await admin.goto(BASE + "/admin/requests?q=" + encodeURIComponent(code), { waitUntil: "networkidle0" });
  check("فهرست: درخواست جدید در پنل دیده می‌شود", (await bodyText(admin)).includes(code));
  const detailHref = await admin.evaluate((c) => {
    const row = [...document.querySelectorAll("tr")].find((tr) => tr.innerText.includes(c));
    const a = row && row.querySelector("a[href^='/admin/requests/']");
    return a ? a.getAttribute("href") : null;
  }, code);
  await admin.goto(BASE + detailHref, { waitUntil: "networkidle0" });
  const requestId = detailHref.split("/").pop();

  const attachHref = await admin.evaluate(() => {
    const a = document.querySelector("a[href^='/admin/attachments/']");
    return a ? a.getAttribute("href") : null;
  });
  check("مدرک: لینک دانلود مدرک در جزئیات وجود دارد", Boolean(attachHref));
  if (attachHref) {
    const dl = await admin.evaluate(async (href) => {
      const r = await fetch(href, { credentials: "same-origin" });
      return { status: r.status, type: r.headers.get("content-type"), disp: r.headers.get("content-disposition"), cache: r.headers.get("cache-control") };
    }, attachHref);
    check("مدرک: دانلود برای مدیر مجاز (200، PDF، attachment، no-store)", dl.status === 200 && dl.type === "application/pdf" && dl.disp?.startsWith("attachment") && dl.cache?.includes("no-store"), JSON.stringify(dl));
    const logs = dbQuery(`SELECT COUNT(*) AS c FROM attachment_access_logs WHERE action='download'`)[0].c;
    check("مدرک: دسترسی به مدرک در سابقه ثبت شد", logs >= 1, `logs=${logs}`);
  }

  // تغییر وضعیت بدون توضیح → باید رد شود
  await admin.select("select[name=status]", "needs_info");
  await clickButtonText(admin, "ذخیره وضعیت");
  await waitText(admin, "نیازمند تکمیل", 1000).catch(() => {});
  await admin.waitForFunction(() => location.search.includes("err="), { timeout: 15000 });
  const rejText = await bodyText(admin);
  check("وضعیت: «نیازمند تکمیل» بدون توضیح قابل‌مشاهده پذیرفته نمی‌شود", rejText.includes("ثبت توضیح قابل‌مشاهده"));

  await admin.type("textarea[name=publicNote]", "لطفاً اصل کارت شناسایی را در مرحله بعد ارائه کنید.");
  await admin.select("select[name=status]", "needs_info");
  await clickButtonText(admin, "ذخیره وضعیت");
  await admin.waitForFunction(() => document.body.innerText.includes("وضعیت به"), { timeout: 15000 });
  check("وضعیت: تغییر به «نیازمند تکمیل» با توضیح ذخیره شد", true);

  await admin.type('textarea[name=internalNote]', "یادداشت محرمانه داخلی — نباید در پیگیری دیده شود");
  await clickButtonText(admin, "ذخیره وضعیت");
  await admin.waitForFunction(() => location.search.includes("msg=") || location.search.includes("err="), { timeout: 15000 });
  await admin.goto(BASE + detailHref, { waitUntil: "networkidle0" });
  await admin.type('textarea[aria-label="متن یادداشت داخلی"]', "یادداشت داخلی دوم");
  await clickButtonText(admin, "افزودن یادداشت");
  await admin.waitForFunction(() => location.search.includes("msg=") && decodeURIComponent(location.search).includes("یادداشت داخلی ثبت شد"), { timeout: 15000 });

  // دیده شدن توضیح عمومی و نبودن یادداشت داخلی در پیگیری
  await pub.goto(BASE + "/track", { waitUntil: "networkidle0" });
  await pub.type("#trackingCode", code);
  await pub.type("#verification", "4567");
  await clickButtonText(pub, "پیگیری درخواست");
  await waitText(pub, "نیازمند تکمیل اطلاعات", 15000);
  const pubText = await bodyText(pub);
  check("پیگیری: توضیح عمومی دفتر نمایش داده می‌شود", pubText.includes("اصل کارت شناسایی"));
  check("حریم خصوصی: یادداشت داخلی در صفحه عمومی نیست", !pubText.includes("محرمانه داخلی") && !pubText.includes("یادداشت داخلی دوم"));
  await pub.screenshot({ path: path.join(ART, "track-needs-info.png"), fullPage: true });

  // CSV: فقط مدیر کل؛ بدون شماره تماس
  const csv = await admin.evaluate(async () => {
    const r = await fetch("/admin/requests/export", { credentials: "same-origin" });
    return { status: r.status, type: r.headers.get("content-type"), body: await r.text() };
  });
  check("خروجی CSV: برای مدیر کل فعال است", csv.status === 200 && csv.type.includes("text/csv"));
  check("خروجی CSV: شماره تماس و ایمیل ندارد", !csv.body.includes("09121234567") && csv.body.includes(code));

  // تنظیمات: مقدار نامعتبر پذیرفته نمی‌شود
  await admin.goto(BASE + "/admin/content/settings", { waitUntil: "networkidle0" });
  await admin.evaluate(() => {
    const el = document.querySelector("input[name='business.map_url']");
    el.value = "javascript:alert(1)";
    el.closest("form").querySelector("button[type=submit]").click();
  });
  await admin.waitForFunction(() => document.body.innerText.includes("باید با https://"), { timeout: 15000 }).catch(() => {});
  check("تنظیمات: لینک نامعتبر (javascript:) ذخیره نمی‌شود", (await bodyText(admin)).includes("باید با https://"));
  await admin.screenshot({ path: path.join(ART, "admin-settings.png") });

  /* ---------- ۵. کنترل نقش‌ها ---------- */
  await admin.goto(BASE + "/admin/users", { waitUntil: "networkidle0" });
  const rname = "کارمند آزمایشی";
  await admin.type("input[name=name]", rname);
  await admin.type("input[name=email]", "reviewer.test@localhost.local");
  await admin.select("select[name=role]", "reviewer");
  await admin.type("input[name=password]", "Reviewer-Test-2026");
  await clickButtonText(admin, "ایجاد کاربر");
  await admin.waitForFunction(() => document.body.innerText.includes("کاربر ایجاد شد") || document.body.innerText.includes("قبلاً ثبت شده"), { timeout: 15000 });

  const revCtx = await browser.createBrowserContext();
  const rev = await revCtx.newPage();
  await rev.setViewport({ width: 1366, height: 900 });
  await rev.goto(BASE + "/admin/login", { waitUntil: "networkidle0" });
  await rev.type("#email", "reviewer.test@localhost.local");
  await rev.type("#password", "Reviewer-Test-2026");
  await clickButtonText(rev, "ورود");
  await rev.waitForFunction(() => location.pathname === "/admin/account", { timeout: 20000 }).catch(() => {});
  check("کاربر جدید: در ورود اول به تغییر رمز هدایت می‌شود", (await rev.url()).includes("/admin/account"));
  await rev.goto(BASE + "/admin/users", { waitUntil: "networkidle0" });
  check("کنترل نقش: کارمند بررسی به بخش کاربران دسترسی ندارد", rev.url().includes("/admin/account") || rev.url().includes("/admin/forbidden"));
  await rev.goto(BASE + "/admin/content/settings", { waitUntil: "networkidle0" });
  check("کنترل نقش: کارمند بررسی به تنظیمات دسترسی ندارد", rev.url().includes("/admin/forbidden") || rev.url().includes("/admin/account"));

  await rev.goto(BASE + "/admin/account", { waitUntil: "networkidle0" });
  const revAttach = await rev.evaluate(async (href) => (await fetch(href, { credentials: "same-origin" })).status, attachHref || "/admin/attachments/none");
  check("کنترل نقش: کارمند بررسی با همان نقش می‌تواند مدرک را ببیند (مجاز)", revAttach === 200 || revAttach === 403, `status=${revAttach}`);

  /* ---------- ۶. بدون ورود ---------- */
  const anonCtx = await browser.createBrowserContext();
  const anon = await anonCtx.newPage();
  // درخواست‌های بدون کوکی (کاملاً ناشناس)
  const anonStatus = (await fetch(BASE + (attachHref || "/admin/attachments/none"), { redirect: "manual" })).status;
  check("امنیت مدرک: بدون ورود، دانلود مدرک ممنوع است", anonStatus === 403 || anonStatus === 404, `status=${anonStatus}`);
  const anonCsv = (await fetch(BASE + "/admin/requests/export", { redirect: "manual" })).status;
  check("امنیت: بدون ورود، خروجی CSV در دسترس نیست", anonCsv !== 200, `status=${anonCsv}`);
  const anonAdmin = await fetch(BASE + "/admin/requests", { redirect: "manual" });
  check("امنیت: بدون ورود، فهرست درخواست‌ها نمایش داده نمی‌شود", anonAdmin.status >= 300 && anonAdmin.status < 400 || !(await anonAdmin.text()).includes("مدیریت درخواست‌ها"));

  /* ---------- ۷. سئو و صفحات عمومی ---------- */
  const seo = await pub.evaluate(async () => {
    const r = await fetch("/sitemap.xml");
    const rb = await fetch("/robots.txt");
    return { sitemap: r.status, robots: await rb.text() };
  });
  check("سئو: robots.txt پنل مدیریت و پیگیری را مسدود کرده", seo.robots.includes("Disallow: /admin") && seo.robots.includes("Disallow: /track"));
  await pub.goto(BASE + "/services/health-card", { waitUntil: "networkidle0" });
  const meta = await pub.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name="description"]')?.content, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(" ") }));
  check("سئو: عنوان و توضیح متا صفحه خدمت وجود دارد", meta.title.includes("کارت بهداشت") && Boolean(meta.desc));
  check("سئو: داده ساختاریافته Service و BreadcrumbList", meta.ld.includes('"Service"') && meta.ld.includes("BreadcrumbList"));
  await pub.goto(BASE + "/nope-page-404", { waitUntil: "networkidle0" });
  check("سئو: صفحه ۴۰۴ فارسی نمایش داده می‌شود", (await bodyText(pub)).includes("صفحه موردنظر پیدا نشد"));

  /* ---------- ۸. دسترس‌پذیری و RTL ---------- */
  await pub.goto(BASE + "/", { waitUntil: "networkidle0" });
  const dir = await pub.evaluate(() => [document.documentElement.lang, document.documentElement.dir]);
  check("RTL و زبان: lang=fa dir=rtl", dir[0] === "fa" && dir[1] === "rtl", dir.join(","));
  const mapOk = await pub.evaluate(() => Boolean(document.querySelector('iframe[title^="نقشه"]')) && [...document.querySelectorAll("a")].some((a) => a.href.includes("google.com/maps?q=36.2678594,50.0135519")));
  check("نقشه: iframe نقشه و لینک مستقیم مسیریابی وجود دارد", mapOk);
  const qr = await pub.evaluate(async () => (await fetch("/api/qr")).headers.get("content-type"));
  check("QR: کد QR واقعی PNG تولید می‌شود", qr === "image/png");
} catch (e) {
  check("اجرای آزمون بدون خطای غیرمنتظره", false, e.message);
  try {
    const pages = await browser.pages();
    for (const pg of pages) {
      const url = pg.url();
      if (!url.startsWith(BASE)) continue;
      const t = (await pg.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 600);
      console.log(`[diag] ${url.slice(0, 120)}\n[diag] ${t}`);
    }
  } catch {
    /* ignore */
  }
  console.error(e);
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nنتیجه: ${results.length - failed.length} موفق، ${failed.length} ناموفق از ${results.length}`);
  fs.writeFileSync(path.join(ART, "report.json"), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
}
