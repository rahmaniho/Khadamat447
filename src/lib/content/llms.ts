/**
 * سازنده فایل llms.txt — بهینه‌سازی برای موتورهای مولد (GEO)
 * ---------------------------------------------------------------
 * llms.txt یک استاندارد نوظهور است که خلاصه‌ای ماشین‌خوان از سایت را
 * در اختیار دستیارهای هوش مصنوعی و موتورهای جست‌وجوی مولد (مانند
 * Google AI Overviews، ChatGPT، Perplexity و Claude) قرار می‌دهد تا
 * پاسخ‌های دقیق‌تری از برند، خدمات، نشانی، ساعات کاری و راهنماهای
 * سایت ارائه کنند.
 *
 * این فایل از همان «منبع یکتای محتوا» سایت (SITE / SERVICES / ARTICLES /
 * FAQS) ساخته می‌شود؛ یعنی هیچ داده‌ای جداگانه نگهداری نمی‌شود و همیشه
 * با خود سایت هم‌گام است.
 */
import { ARTICLES, FAQS, SERVICES } from "@/lib/content";
import { SITE } from "@/lib/content/site";
import { absolute, siteUrl } from "@/lib/seo";

/** صفحه‌های اصلی سایت برای بخش پیوندها */
const KEY_PAGES: Array<{ title: string; path: string; description: string }> = [
  { title: "صفحه اصلی", path: "/", description: "معرفی دفتر، خدمات پرطرفدار و دسترسی سریع" },
  { title: "خدمات", path: "/services", description: "فهرست کامل خدمات همراه با جدول مقایسه" },
  { title: "ثبت درخواست آنلاین", path: "/request", description: "فرم گام‌به‌گام ثبت درخواست با کد پیگیری اختصاصی" },
  { title: "پیگیری درخواست", path: "/track", description: "پیگیری وضعیت با کد رهگیری و چهار رقم آخر شماره تماس" },
  { title: "راهنمای گام‌به‌گام", path: "/guide", description: "مسیر دریافت هر خدمت و جدول مدارک لازم" },
  { title: "پرسش‌های متداول", path: "/faq", description: "پاسخ پرسش‌های پرتکرار درباره مدارک، زمان بررسی و پیگیری" },
  { title: "آموزش‌ها و مقالات", path: "/articles", description: `${ARTICLES.length} راهنمای آموزشی درباره خدمات بهداشت اصناف` },
  { title: "درباره ما", path: "/about", description: "معرفی دفتر خدمات سلامت ۴۷۷، حوزه فعالیت و ارزش‌ها" },
  { title: "تماس و موقعیت", path: "/contact", description: "نشانی، نقشه، ساعات کاری و کانال‌های ارتباطی" },
  { title: "وضعیت سامانه", path: "/status", description: "دسترس‌پذیری سرویس‌ها و سابقه رویدادها" },
];

/**
 * ساخت متن llms.txt (Markdown خالص، بدون HTML).
 * تابع خالص است تا بتوان آن را مستقیماً آزمون کرد.
 */
export function buildLlmsText(): string {
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    `${SITE.name} (${SITE.latin}) یک دفتر خدمات سلامت و بهداشت اصناف در ${SITE.city}، استان ${SITE.province}، ایران است. ` +
      `این سامانه امکان ثبت درخواست آنلاین، بارگذاری مدارک و پیگیری وضعیت با کد رهگیری اختصاصی را برای خدمت‌هایی مانند ` +
      SERVICES.map((s) => s.title).join("، ") +
      " فراهم می‌کند.",
  );
  lines.push("");
  lines.push("## اطلاعات تماس و موقعیت");
  lines.push("");
  lines.push(`- نشانی: ${SITE.addressFull}`);
  for (const phone of SITE.phones) {
    lines.push(`- ${phone.label}: ${phone.display} (بین‌المللی: +98${phone.value.replace(/^0/, "")})`);
  }
  lines.push(`- ایمیل: ${SITE.email}`);
  lines.push(`- ساعات کاری: ${SITE.hours.map((h) => `${h.day}: ${h.hours}`).join(" | ")}`);
  lines.push(`- موقعیت جغرافیایی: ${SITE.lat}, ${SITE.lng}`);
  lines.push(`- نقشه: ${SITE.mapProfileUrl}`);
  lines.push("");

  lines.push("## خدمات");
  lines.push("");
  for (const service of SERVICES) {
    lines.push(`- [${service.title}](${absolute(`/services/${service.slug}`)}): ${service.summary}`);
  }
  lines.push("");

  lines.push("## راهنماها و مقالات آموزشی");
  lines.push("");
  for (const article of ARTICLES) {
    lines.push(`- [${article.title}](${absolute(`/articles/${article.slug}`)}): ${article.excerpt}`);
  }
  lines.push("");

  lines.push("## پرسش‌های متداول (گزیده)");
  lines.push("");
  for (const faq of FAQS.slice(0, 12)) {
    lines.push(`- ${faq.question}: ${faq.plainAnswer}`);
  }
  lines.push("");

  lines.push("## صفحه‌های کلیدی");
  lines.push("");
  for (const page of KEY_PAGES) {
    lines.push(`- [${page.title}](${absolute(page.path)}): ${page.description}`);
  }
  lines.push("");

  lines.push("## یادداشت‌ها");
  lines.push("");
  lines.push(
    "- ثبت درخواست آنلاین به معنای صدور قطعی مجوز یا کارت نیست؛ نتیجه پس از بررسی کارشناس اعلام می‌شود.",
  );
  lines.push("- زبان سایت فارسی (fa-IR) است و به کاربران در استان قزوین خدمت می‌دهد.");
  lines.push(`- نشانی پایه سایت: ${siteUrl()}`);
  lines.push("");

  return lines.join("\n");
}
