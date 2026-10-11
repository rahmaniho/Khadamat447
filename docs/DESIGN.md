# زبان طراحی سامانه

سامانه با یک کیت رابط یکپارچه ساخته شده است؛ همه صفحه‌ها از همان توکن‌ها و اجزا استفاده می‌کنند.

## ۱. پالت رنگ

| نقش | نمونه توکن | کاربرد |
|---|---|---|
| برند (سبز–فیروزه‌ای) | `brand-50 … brand-950` | دکمه اصلی، لینک، تأکیدها |
| طلایی | `gold-50 … gold-900` | نشان‌های ویژه، «پرطرفدار»، اطلاعیه |
| خنثی | `ink-50 … ink-950` | متن، مرزها، پس‌زمینه‌های خنثی |
| وضعیت | `success · warn · danger · info` | وضعیت درخواست، اعلان‌ها، هشدارها |

رنگ‌ها در `src/app/globals.css` با `@theme` تعریف شده‌اند و در حالت تاریک با متغیرهای
`--page-bg`، `--surface`، `--surface-muted`، `--border-soft` بازتعریف می‌شوند.

## ۲. تایپوگرافی

- فونت **وزیرمتن** (متغیر، `woff2` محلی) — بدون درخواست به CDN
- مقیاس‌ها: `text-[0.68rem]` (برچسب) ← `text-[0.82rem]` (متن) ← `text-xl`…`text-4xl` (تیتر)
- اعداد فارسی: همه‌جا از `toFaDigits` / `faNumber` و کلاس `numeric` استفاده می‌شود
- جهت: `dir="rtl"` سراسری؛ فیلدهای لاتین (ایمیل، کد پیگیری) با `dir="ltr"` و ترازبندی شروع

## ۳. اجزای پایه (`src/components/ui`)

| فایل | اجزا |
|---|---|
| `primitives.tsx` | `Button`، `ButtonLink`، `Badge`، `Chip`، `Card`، `SectionHeading`، `StatCard`، `Metric`، `Progress`، `Avatar`، `Rating`، `Divider`، `EmptyState`، `Skeleton`، `Alert`، `Kbd`، `Timeline` |
| `form.tsx` | `Field`، `Input`، `Textarea`، `Select`، `Checkbox`، `RadioGroup`، `Switch`، `SegmentedControl`، `SearchInput`، `FileDrop` |
| `overlay.tsx` | `Modal`، `ConfirmDialog`، `Drawer`، `Tabs`، `Accordion`، `Tooltip`، `ToasterHost`، `Reveal`، `Counter` |
| `icons.tsx` | ۹۴ آیکون خطی SVG بدون وابستگی، هم‌اندازه و هم‌رنگ با متن |
| `admin/charts.tsx` | `AreaChart`، `BarsChart`، `DonutChart`، `Sparkline` (SVG سبک، بدون کتابخانه نمودار) |

## ۴. الگوهای تعاملی

- **وضعیت‌ها**: هفت وضعیت درخواست با رنگ و آیکون یکتا (`new → pending_review → needs_info → in_review → ready_to_report → completed` + `rejected`)
- **خط زمانی**: رویدادهای عمومی (قابل مشاهدهٔ مراجع) و داخلی (فقط کارشناسان) با آیکون قفل/چشم
- **اعلان‌ها**: پیام‌های کوتاه گوشهٔ صفحه با چهار لحن (موفق، خطا، اطلاع، هشدار)
- **جدول‌ها**: انتخاب گروهی، فیلتر زنده، مرتب‌سازی، صفحه‌بندی و خروجی CSV
- **پیش‌نویس خودکار**: فرم ثبت درخواست هر ۳۰ ثانیه در مرورگر ذخیره می‌شود

## ۵. حرکت (Motion)

- انیمیشن‌های ورود: `fade-up`، `fade-in`، `scale-in` (کوتاه، ۳۰۰–۵۰۰ms)
- `Reveal` برای ظاهر شدن بخش‌ها هنگام اسکرول (یک‌بار)
- احترام کامل به `prefers-reduced-motion: reduce` (همه انیمیشن‌ها خاموش می‌شوند)

## ۶. دسترس‌پذیری

- کنتراست متن بر پایه WCAG AA؛ حالت تاریک با بازتعریف متغیرها
- همه دکمه‌های آیکونی `aria-label` دارند؛ فیلدها `label` واقعی دارند
- `aria-pressed` برای چیپ‌های فیلتر، `role="status"` برای اعلان‌ها، `aria-valuenow` برای نوار پیشرفت
- پیمایش کامل با صفحه‌کلید در مودال‌ها (بستن با `Esc`، قفل اسکرول، تمرکز روی محتوا)
- استایل چاپ اختصاصی برای پرونده درخواست و صفحهٔ موفقیت

## ۷. ساختار صفحه

همه صفحه‌های عمومی از یک ترکیب مشترک استفاده می‌کنند:

```
PageHero      → تیتر، توضیح، نشان‌ها، مسیر راهنما (breadcrumb)
Section       → فاصله و پس‌زمینه یکدست (tone: default | surface)
… محتوای صفحه (Cards، Grid، Table، Accordion)
CtaBand       → فراخوان پایانی با دو دکمه
```
