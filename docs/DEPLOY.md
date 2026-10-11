# استقرار (Deployment)

> این پروژه هیچ وابستگی سروری ندارد: نه پایگاه داده، نه API، نه متغیر محیطی اجباری.
> کل منطق در مرورگر اجرا می‌شود و خروجی می‌تواند کاملاً استاتیک باشد.

---

## ۱. Vercel (پیشنهادی — سریع‌ترین مسیر)

### الف) از داشبورد
1. وارد [vercel.com/new](https://vercel.com/new) شوید و مخزن GitHub را انتخاب کنید.
2. تنظیمات را تغییر ندهید (Framework: **Next.js**، Build Command: `npm run build`، Node 22).
3. **Deploy** را بزنید. کمتر از یک دقیقه، سایت روی `https://<project>.vercel.app` بالا می‌آید.

### ب) با CLI
```bash
npm i -g vercel        # یک‌بار
vercel                 # پیش‌نمایش
vercel --prod          # انتشار نهایی
```

### متغیرهای محیطی (اختیاری)
| نام | توضیح | پیش‌فرض |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | دامنه نهایی برای `canonical`، `sitemap.xml` و Open Graph | `https://khadamat447.ir` |

میان‌بر: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rahmaniho/Khadamat447)

---

## ۲. GitHub Pages (استاتیک)

```bash
bash scripts/build-static.sh     # → out/ با basePath=/Khadamat447
```

گردش‌کار آماده در `.github/workflows/deploy-pages.yml`:
- روی هر push به شاخه `main` (یا اجرای دستی `workflow_dispatch`) اجرا می‌شود
- `STATIC_EXPORT=true` را تنظیم و خروجی را در `out/` می‌سازد
- فایل `.nojekyll` را اضافه می‌کند و روی Pages منتشر می‌کند

آدرس نهایی: `https://<user>.github.io/Khadamat447/`

> نکته: در حالت استاتیک، `basePath` روی `/Khadamat447` تنظیم می‌شود. اگر روی دامنهٔ
> اختصاصی منتشر می‌کنید، `basePath` را در `next.config.ts` خالی کنید.

پیش‌نیاز یک‌باره در تنظیمات مخزن: **Settings → Pages → Source: GitHub Actions**.

---

## ۳. هر میزبان فایل ایستا (Netlify، Cloudflare Pages، هاست ساده، …)

```bash
STATIC_EXPORT=true npx next build      # خروجی: out/
```
پوشه `out/` را روی میزبان آپلود کنید. هیچ فرایند Node لازم نیست.
در Netlify/Cloudflare Pages تنظیمات زیر کافی است:

| تنظیم | مقدار |
|---|---|
| Build command | `bash scripts/build-static.sh` (یا `STATIC_EXPORT=true npx next build`) |
| Publish directory | `out` |

---

## ۴. پس از استقرار (سئو و بررسی)

1. `NEXT_PUBLIC_SITE_URL` را با دامنهٔ واقعی تنظیم کنید و دوباره منتشر کنید.
2. `/sitemap.xml` و `/robots.txt` را باز کنید و دامنه را بررسی کنید.
3. آدرس سایت را در [Google Search Console](https://search.google.com/search-console) ثبت و نقشه سایت را معرفی کنید.
4. داده ساختاریافته را با [Rich Results Test](https://search.google.com/test/rich-results) بیازمایید
   (سازمان، خدمات، مقالات، پرسش‌های متداول).
5. صفحه‌های `/admin`، `/track` و `/search` با `noindex` و سرصفحه‌های امنیتی محافظت می‌شوند؛ پس از استقرار بررسی کنید.
6. برای امتیاز ظاهری و سرعت: `Images` از فرمت `webp` استفاده می‌کند و فونت به‌صورت محلی سرو می‌شود.

---

## ۵. دامنه و HTTPS

- در Vercel/Netlify/Cloudflare، دامنه را از بخش Domains اضافه کنید و رکوردهای DNS را مطابق راهنمای میزبان تنظیم کنید.
- HTTPS به‌صورت خودکار صادر می‌شود؛ در هاست ساده از Let's Encrypt (Certbot) استفاده کنید.
- پس از اتصال دامنه، مقدار `NEXT_PUBLIC_SITE_URL` را به‌روزرسانی کنید تا `canonical`ها درست شوند.

---

## ۶. نسخه پشتیبان داده‌ها

داده‌های نمایشی در مرورگر بازدیدکننده ذخیره می‌شوند. برای گرفتن نسخه پشتیبان:

- پیشخوان → **تنظیمات** → «دریافت فایل پشتیبان» (JSON کامل)
- پیشخوان → **سابقه رویدادها** → «خروجی JSON»
- کارتابل درخواست‌ها → «خروجی CSV»

برای بازگردانی، فایل JSON را نگه دارید؛ ساختار آن با `src/lib/store/types.ts` (`AppState`) مطابقت دارد.
