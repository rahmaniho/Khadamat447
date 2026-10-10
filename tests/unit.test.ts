/**
 * آزمون‌های واحد برای منطق خالص سامانه
 * اجرا: npm test  (node --experimental-strip-types --test)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, isAnyPhone, maskPhone, newTrackingCode, formatFaDate, toEnDigits, phoneLast4, slugify } from "../src/lib/utils";
import { renderMarkdown } from "../src/lib/markdown";
import { detectFileType, sanitizeOriginalName } from "../src/lib/files";
import { validateServiceFields, validateApplicant } from "../src/lib/validation";
import { validateSettingValue, fieldByKey } from "../src/lib/settings-validate";
import { renderTemplate } from "../src/lib/notifications/index";
import { passwordIssues } from "../src/lib/auth/password";

test("شماره تماس: یکسان‌سازی اعداد فارسی و پیش‌شماره", () => {
  assert.equal(normalizePhone("۰۹۱۲ ۳۴۵ ۶۷۸۹"), "09123456789");
  assert.equal(normalizePhone("+989123456789"), "09123456789");
  assert.equal(normalizePhone("00989123456789"), "09123456789");
  assert.equal(normalizePhone("9123456789"), "09123456789");
  assert.equal(isAnyPhone("09398520150"), true);
  assert.equal(isAnyPhone("02833992550"), true);
  assert.equal(isAnyPhone("12345"), false);
  assert.equal(isAnyPhone("abc"), false);
  assert.equal(phoneLast4("۰۹۱۲۳۴۵۶۷۸۹"), "6789");
});

test("نمایش ناقص شماره در عمومی", () => {
  const m = maskPhone("09123456789");
  assert.ok(!m.includes("3456"), "ارقام میانی نباید نمایش داده شوند");
  assert.ok(m.endsWith("789"));
});

test("کد پیگیری: قالب ثابت و بدون کاراکترهای مبهم", () => {
  for (let i = 0; i < 200; i++) {
    const c = newTrackingCode();
    assert.match(c, /^K447-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/);
    assert.ok(!/[01IO]/.test(c.slice(4)), "کاراکتر مبهم در کد");
  }
  const set = new Set(Array.from({ length: 500 }, () => newTrackingCode()));
  assert.equal(set.size, 500, "کدها باید تقریباً یکتا باشند");
});

test("تاریخ شمسی: ۱۰ اکتبر ۲۰۲۶ = ۱۸ مهر ۱۴۰۵", () => {
  const out = formatFaDate("2026-10-10T08:30:00.000Z", false);
  assert.equal(out, "۱۸ مهر ۱۴۰۵");
});

test("تبدیل ارقام فارسی به انگلیسی", () => {
  assert.equal(toEnDigits("۱۴۰۵/۰۷"), "1405/07");
  assert.equal(toEnDigits("٠١٢"), "012");
});

test("اسلاگ فارسی و لاتین", () => {
  assert.equal(slugify("  Health Card: Guide! "), "health-card-guide");
});

test("Markdown: HTML خام و اسکریپت escape می‌شود (ضد XSS)", () => {
  const html = renderMarkdown('<script>alert(1)</script> **بold** [x](javascript:alert(1)) [ok](https://example.com)');
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!/href="javascript:/i.test(html), "لینک javascript نباید رندر شود");
  assert.ok(html.includes('href="https://example.com"'));
  assert.ok(html.includes("<strong>"));
});

test("Markdown: فهرست‌ها و نقل‌قول", () => {
  const html = renderMarkdown("## عنوان\n\n- یک\n- دو\n\n> توجه");
  assert.ok(html.includes("<h3>عنوان</h3>"));
  assert.ok(html.includes("<ul>"));
  assert.ok(html.includes("<blockquote>"));
});

test("بررسی نوع واقعی فایل: PDF و تصویر پذیرفته، اجرایی رد می‌شود", () => {
  const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(32)]);
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]);
  const exe = Buffer.concat([Buffer.from("MZ"), Buffer.alloc(32)]);
  assert.equal(detectFileType(pdf, "a.pdf").ok, true);
  assert.equal(detectFileType(png, "a.png").ok, true);
  assert.equal(detectFileType(jpg, "a.jpg").ok, true);
  assert.equal(detectFileType(exe, "a.pdf").ok, false, "فایل اجرایی با پسوند جعلی رد شود");
  assert.equal(detectFileType(pdf, "a.png").ok, false, "عدم تطابق پسوند و محتوا رد شود");
});

test("نام فایل: مسیر و کاراکترهای خطرناک حذف می‌شوند", () => {
  const n = sanitizeOriginalName("../../etc/passwd<>.pdf");
  assert.ok(!n.includes("/") && !n.includes("..") && !n.includes("<"));
  assert.equal(sanitizeOriginalName(""), "file");
});

test("اعتبارسنجی متقاضی: ایمیل فقط در صورت انتخاب ایمیل الزامی است", () => {
  const base = {
    clientSubmissionId: "abcdefgh12345",
    serviceSlug: "health-card",
    requesterType: "person",
    fullName: "علی احمدی",
    phone: "۰۹۱۲۱۲۳۴۵۶۷",
    email: "",
    city: "قزوین",
    orgName: "",
    preferredContact: "phone",
    message: "",
    consentAccuracy: true,
    consentPrivacy: true,
  };
  const ok = validateApplicant(base);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.data.phoneNormalized, "09121234567");
  const noEmail = validateApplicant({ ...base, preferredContact: "email" });
  assert.equal(noEmail.ok, false);
  const noConsent = validateApplicant({ ...base, consentPrivacy: false });
  assert.equal(noConsent.ok, false);
  const badPhone = validateApplicant({ ...base, phone: "123" });
  assert.equal(badPhone.ok, false);
});

test("فیلدهای خدمت: الزامی، گزینه‌های مجاز و عدد", () => {
  const defs = [
    { id: "1", field_key: "request_kind", label: "نوع", type: "select", options_json: JSON.stringify(["جدید", "تمدید"]), required: 1 },
    { id: "2", field_key: "count", label: "تعداد", type: "number", options_json: "[]", required: 0 },
  ];
  assert.equal(validateServiceFields(defs, {}).ok, false);
  assert.equal(validateServiceFields(defs, { request_kind: "نامعتبر" }).ok, false);
  assert.equal(validateServiceFields(defs, { request_kind: "جدید", count: "abc" }).ok, false);
  const good = validateServiceFields(defs, { request_kind: "جدید", count: "۳" });
  assert.equal(good.ok, true);
  if (good.ok) assert.equal(good.fields.find((f) => f.key === "count")?.value, "3");
  // کلیدهای ناشناخته پذیرفته نمی‌شوند (فقط فیلدهای تعریف‌شده خوانده می‌شوند)
  const extra = validateServiceFields(defs, { request_kind: "جدید", injected: "x" });
  assert.equal(extra.ok && extra.fields.some((f) => f.key === "injected"), false);
});

test("تنظیمات: فقط مقادیر معتبر ذخیره می‌شوند", () => {
  const url = fieldByKey("business.map_url")!;
  assert.equal(validateSettingValue(url, "javascript:alert(1)").ok, false);
  assert.equal(validateSettingValue(url, "https://www.google.com/maps?q=36.2,50.0").ok, true);
  const ext = fieldByKey("form.allowed_extensions")!;
  assert.equal(validateSettingValue(ext, ".pdf,.exe").ok, false, "exe نباید مجاز شود");
  assert.equal(validateSettingValue(ext, ".pdf, .PNG").ok, true);
  const hours = fieldByKey("business.hours_json")!;
  assert.equal(validateSettingValue(hours, "[]").ok, true);
  assert.equal(validateSettingValue(hours, "{bad").ok, false);
  const social = fieldByKey("business.social_json")!;
  assert.equal(validateSettingValue(social, '[{"label":"x","url":"http://insecure"}]').ok, false);
  const maxMb = fieldByKey("form.max_file_mb")!;
  assert.equal(validateSettingValue(maxMb, "500").ok, false);
});

test("قالب اعلان: جایگزینی متغیرها و بدون افشای متغیر ناشناخته", () => {
  const out = renderTemplate("کد: {tracking_code} - {service} - {unknown}", { tracking_code: "K447-ABCDE-FGHJ", service: "کارت بهداشت" });
  assert.equal(out, "کد: K447-ABCDE-FGHJ - کارت بهداشت - ");
});

test("رمز عبور: حداقل طول و ترکیب", () => {
  assert.ok(passwordIssues("short").length > 0);
  assert.equal(passwordIssues("LongPassword2026").length, 0);
});
