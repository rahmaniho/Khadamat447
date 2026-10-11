#!/usr/bin/env bash
# ---------------------------------------------------------------
# ساخت خروجی استاتیک (GitHub Pages / هر میزبان فایل ایستا)
# ---------------------------------------------------------------
# همه بخش‌های سایت — از جمله پیشخوان مدیریت، ثبت درخواست، پیگیری و
# جست‌وجو — سمت مرورگر اجرا می‌شوند؛ بنابراین خروجی استاتیک کامل است
# و هیچ صفحه‌ای «نیازمند سرور» نیست.
#
# اجرا:
#   bash scripts/build-static.sh
# خروجی: out/  (آمادهٔ انتشار؛ شامل .nojekyll برای GitHub Pages)
set -e

cd "$(dirname "$0")/.."
ROOT=$(pwd)

echo "→ پاک‌سازی خروجی‌های قبلی"
rm -rf "$ROOT/.next" "$ROOT/out"

echo "→ ساخت خروجی استاتیک (STATIC_EXPORT=true)"
STATIC_EXPORT=true npx next build

echo "→ افزودن فایل‌های لازم GitHub Pages"
touch "$ROOT/out/.nojekyll"

echo ""
echo "✓ ساخت کامل شد — خروجی در: $ROOT/out"
echo "  مسیر پایه (basePath): /Khadamat447"
du -sh "$ROOT/out" 2>/dev/null || true
