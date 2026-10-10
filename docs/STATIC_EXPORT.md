# خروجی استاتیک (Static Export) برای GitHub Pages

این پروژه از **Next.js Static Export** پشتیبانی می‌کند و می‌تواند به‌صورت
HTML/CSS/JS ایستا روی **GitHub Pages** منتشر شود.

## محدودیت‌ها

در حالت static، این قابلیت‌ها **غیرفعال** هستند (با پیام «نیازمند سرور» نمایش
داده می‌شوند):

- **پنل مدیریت** (`/admin/...`)
- **API QR** (`/api/qr/...`) — یک تصویر PNG ثابت ۱×۱ برمی‌گردد
- **ثبت درخواست** — فرم نمایشی
- **پیگیری درخواست** — فرم نمایشی
- **جست‌وجو** — بدون پایگاه داده، فقط داده‌های seed

سایر صفحات (خانه، خدمات، مقالات، سؤالات متداول، درباره، تماس، راهنما،
حریم خصوصی، قوانین) **به‌طور کامل** با محتوای فارسی، RTL، تصاویر و SEO
ساخته می‌شوند.

## ساخت خروجی

### پیش‌نیاز
- Node.js ≥ 22
- وابستگی‌ها نصب شده (`npm ci`)

### دستور
```bash
bash scripts/build-static.sh
```

این اسکریپت:

1. پوشه‌های `src/app/admin` و `src/app/api` را پشتیبان می‌گیرد.
2. فایل‌های `actions.ts` (Server Actions) را که در static export پشتیبانی
   نمی‌شوند، موقتاً حذف می‌کند.
3. صفحات و route handlerهای admin/api را با نسخه‌ی نمایشی جایگزین می‌کند.
4. `next build` را با `STATIC_EXPORT=true` اجرا می‌کند.
5. همه‌ی فایل‌های اصلی را پس از پایان بازمی‌گرداند.
6. فایل `.nojekyll` را در `out/` ایجاد می‌کند.

خروجی در پوشه‌ی `out/` قرار می‌گیرد.

## استقرار روی GitHub Pages

### روش ۱: GitHub Actions (توصیه‌شده)

فایل `.github/workflows/deploy-pages.yml` به‌طور خودکار با هر push به
شاخه‌ی `main`:

1. خروجی static را می‌سازد.
2. آن را در GitHub Pages منتشر می‌کند.

برای فعال‌سازی:

1. در تنظیمات ریپازیتوری، به **Settings → Pages** بروید.
2. در بخش **Source** گزینه‌ی **GitHub Actions** را انتخاب کنید.
3. شاخه‌ی `main` را به‌عنوان منبع انتخاب کنید.
4. Push کنید؛ workflow به‌طور خودکار اجرا می‌شود.

نشانی سایت: `https://<user>.github.io/Khadamat447/`

### روش ۲: دستی

```bash
# ساخت خروجی
bash scripts/build-static.sh

# کپی خروجی به شاخه‌ی gh-pages
git worktree add /tmp/gh-pages gh-pages
rm -rf /tmp/gh-pages/*
cp -r out/* /tmp/gh-pages/
touch /tmp/gh-pages/.nojekyll
cd /tmp/gh-pages
git add -A
git commit -m "Deploy static site"
git push origin gh-pages
```

سپس در تنظیمات GitHub Pages شاخه‌ی `gh-pages` را انتخاب کنید.

## تغییرات فنی

### پیکربندی

- `next.config.ts`: `output: 'export'`, `basePath: '/Khadamat447'`,
  `trailingSlash: true`, `images.unoptimized: true`
- `src/app/layout.tsx`: حذف `export const dynamic = "force-dynamic"`
- `src/app/sitemap.ts` و `robots.ts`: `export const dynamic = "force-static"`
- `src/app/manifest.ts`: `export const dynamic = "force-static"`

### لایه‌ی داده

- `src/lib/static-data.ts`: توابع pure برای سرو داده‌های seed بدون DB
- `src/lib/queries.ts` و `src/lib/site.ts`: در حالت static از داده‌های
  in-memory استفاده می‌کنند
- `src/lib/db/seed.ts`: ثابت‌های `SERVICES_SEED`, `FIELDS_SEED`,
  `FAQS_SEED`, `ARTICLES_SEED` export می‌شوند

### صفحات اصلاح‌شده

- `src/app/(public)/request/page.tsx`: در حالت static، فرم چندمرحله‌ای
  نمایش داده نمی‌شود و فقط فهرست خدمات و پیام «نیازمند سرور» نمایش داده
  می‌شود.
- `src/app/(public)/request/actions.ts` و `track/actions.ts`: در حالت
  static، پیام «نیازمند سرور» برمی‌گردانند.
- `src/app/(public)/request/success/page.tsx`: در حالت static کد پیگیری
  نمایش داده نمی‌شود.
- `src/app/(public)/articles/page.tsx`، `faq/page.tsx`، `search/page.tsx`:
  در زمان build، `searchParams` خالی در نظر گرفته می‌شود.

### Dynamic routes

- `src/app/(public)/articles/[slug]/page.tsx` و
  `src/app/(public)/services/[slug]/page.tsx`: با `generateStaticParams`
  در build-time تمام اسلاگ‌ها را generate می‌کنند.

## نکته‌ی مهم درباره‌ی Search Engines

در حالت static، `sitemap.xml` و `robots.txt` با basePath صحیح
(`/Khadamat447/`) ساخته می‌شوند. canonical link ها نیز به‌درستی تنظیم
شده‌اند.

اگر دامنه‌ی سفارشی دارید، مقدار `NEXT_PUBLIC_SITE_URL` را در
`build-static.sh` یا GitHub Actions تنظیم کنید.
