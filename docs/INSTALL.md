# راهنمای نصب و اجرای محلی

## پیش‌نیازها
- Node.js **۲۲** یا جدیدتر (شامل ماژول داخلی `node:sqlite`)
- npm
- (اختیاری) PostgreSQL ۱۴ یا جدیدتر برای محیط عملیاتی

## نصب
```bash
git clone <repo-url> Khadamat447
cd Khadamat447
npm ci
cp .env.example .env        # مقادیر را ویرایش کنید
```

## اجرا در حالت توسعه
```bash
npm run dev                 # http://localhost:3000
```

## اولین ورود مدیر
- اگر `ADMIN_EMAIL` و `ADMIN_PASSWORD` در `.env` باشند، همان کاربر مدیر کل ساخته می‌شود.
- اگر تنظیم نشده باشند، رمز تصادفی در `.data/INITIAL_ADMIN_PASSWORD.txt` (با دسترسی 0600) نوشته می‌شود. پس از اولین ورود، رمز را تغییر دهید و فایل را حذف کنید.
- ورود: `http://localhost:3000/admin/login`

برای ساخت یا بازنشانی مدیر کل از خط فرمان:
```bash
ADMIN_NEW_PASSWORD='رمز-حداقل-۱۰-نویسه-با-عدد' npm run admin:create-owner -- owner@example.org "نام مدیر"
```

## ساخت و اجرای نسخه تولیدی
```bash
npm run build
npm start                   # 0.0.0.0:3000
```

## آزمون‌ها
```bash
npm run typecheck           # بررسی تایپ
npm test                    # آزمون‌های واحد (۱۵ مورد)
# آزمون سرتاسری با مرورگر (نیازمند سرور در حال اجرا و Chrome):
CHROME_PATH=/path/to/chrome ADMIN_PASSWORD=... npm run test:e2e
```
جزئیات و نتایج در `docs/TEST_REPORT.md`.

## پشتیبان‌گیری (SQLite)
```bash
npm run db:backup           # خروجی در .data/backups با دسترسی 0600
```
فایل‌های مدارک در `.data/uploads` (یا `STORAGE_DIR`) هستند؛ همراه پشتیبان پایگاه داده نگهداری شوند.
