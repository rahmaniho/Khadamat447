#!/usr/bin/env bash
# Build static export and restore admin/api files
# ---------------------------------------------------------------
# 1) Backup admin and api folders (to .build-backup/ inside project)
# 2) Wipe route files (pages, route handlers) but keep _actions
# 3) Replace with minimal placeholders
# 4) Run next build
# 5) Restore originals
# 6) `out/` directory contains the static site
set -e

cd "$(dirname "$0")/.."
ROOT=$(pwd)

echo "→ Clean .next cache and old backup"
rm -rf "$ROOT/.next" "$ROOT/.build-backup"

# 1) Backup
echo "→ Backup admin, api, and public actions"
mkdir -p "$ROOT/.build-backup"
cp -r "$ROOT/src/app/admin" "$ROOT/.build-backup/admin"
cp -r "$ROOT/src/app/api" "$ROOT/.build-backup/api"
# backup server actions files (نه برای حذف، فقط برای بازگردانی)
mkdir -p "$ROOT/.build-backup/public-actions"
cp "$ROOT/src/app/(public)/request/actions.ts" "$ROOT/.build-backup/public-actions/request-actions.ts" 2>/dev/null || true
cp "$ROOT/src/app/(public)/track/actions.ts" "$ROOT/.build-backup/public-actions/track-actions.ts" 2>/dev/null || true
echo "   backed up: $(find $ROOT/.build-backup -type f | wc -l) files"

# 2) Wipe and replace with placeholders (keep _actions!)
echo "→ Replace route files with static-safe placeholders"

rm -rf "$ROOT/src/app/admin" "$ROOT/src/app/api"
mkdir -p "$ROOT/src/app/admin/_actions" "$ROOT/src/app/api/qr"

# کپی _actions از backup
cp -r "$ROOT/.build-backup/admin/_actions/." "$ROOT/src/app/admin/_actions/"

# /admin: یک صفحه‌ی نمایشی ساده
cat > "$ROOT/src/app/admin/page.tsx" <<'EOF'
export const dynamic = "force-static";
export default function AdminStaticPlaceholder() {
  return (
    <div style={{ padding: "4rem 1.5rem", maxWidth: "40rem", margin: "0 auto", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>پنل مدیریت</h1>
      <p style={{ marginTop: "1rem", lineHeight: 2, color: "#475569" }}>
        این بخش فقط در نسخه‌ی کامل سایت (با سرور و پایگاه داده) فعال است.
      </p>
    </div>
  );
}
EOF

# /api/qr: یک PNG 1x1 ساده
cat > "$ROOT/src/app/api/qr/route.ts" <<'EOF'
export const dynamic = "force-static";
export async function GET() {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );
  return new Response(png, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}
EOF

# حذف server actions فایل‌ها در حالت static (پشتیبانی نمی‌شوند)
echo "→ Remove server actions and dependent components for static export"
rm -f "$ROOT/src/app/(public)/request/actions.ts"
rm -f "$ROOT/src/app/(public)/track/actions.ts"

# جایگزینی request-wizard و track-form با نسخه‌ی نمایشی
cp -f "$ROOT/src/components/request-wizard.tsx" "$ROOT/.build-backup/request-wizard.tsx.bak" 2>/dev/null || true
cp -f "$ROOT/src/components/track-form.tsx" "$ROOT/.build-backup/track-form.tsx.bak" 2>/dev/null || true

cat > "$ROOT/src/components/request-wizard.tsx" <<'EOF'
/** نسخه‌ی نمایشی فرم چندمرحله‌ای برای حالت static export */
import Link from "next/link";

export type WizardService = {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  allowAttachments: boolean;
  maxAttachments: number;
  documentsMd: string;
  reviewed: boolean;
  fields: Array<{ key: string; label: string; type: string; options?: string[]; placeholder?: string; helpText?: string; required?: boolean }>;
};

type Props = {
  services: WizardService[];
  initialService?: string;
  config: { maxFileMb: number; allowedExtensions: string[]; retentionText: string; privacyText: string; contactPhone: string };
};

export function RequestWizard({ services }: Props) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <p className="font-bold">فرم ثبت درخواست فقط در نسخه‌ی کامل سایت فعال است.</p>
      <p className="mt-2 text-sm leading-7">
        برای ارسال درخواست، لطفاً از طریق صفحه «تماس با ما» با دفتر تماس بگیرید یا به‌صورت حضوری مراجعه کنید.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.slug} className="rounded-xl bg-white p-3 ring-1 ring-amber-200">
            <p className="text-sm font-extrabold">{s.title}</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">{s.tagline}</p>
          </div>
        ))}
      </div>
      <Link href="/contact" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white">
        راه‌های تماس
      </Link>
    </div>
  );
}
EOF

cat > "$ROOT/src/components/track-form.tsx" <<'EOF'
/** نسخه‌ی نمایشی فرم پیگیری برای حالت static export */
import Link from "next/link";

export function TrackForm() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <p className="font-bold">پیگیری درخواست فقط در نسخه‌ی کامل سایت فعال است.</p>
      <p className="mt-2 text-sm leading-7">
        برای اطلاع از وضعیت درخواست خود، لطفاً با شماره‌های دفتر (صفحه «تماس با ما») تماس بگیرید.
      </p>
      <Link href="/contact" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white">
        راه‌های تماس
      </Link>
    </div>
  );
}
EOF

# 3) Build
echo "→ Run next build"
STATIC_EXPORT=true npx next build 2>&1 | tail -80
BUILD_STATUS=${PIPESTATUS[0]}

# 4) Restore
echo "→ Restore admin, api, and public actions"
rm -rf "$ROOT/src/app/admin" "$ROOT/src/app/api"
cp -r "$ROOT/.build-backup/admin" "$ROOT/src/app/admin"
cp -r "$ROOT/.build-backup/api" "$ROOT/src/app/api"
# بازگردانی server actions
cp "$ROOT/.build-backup/public-actions/request-actions.ts" "$ROOT/src/app/(public)/request/actions.ts" 2>/dev/null || true
cp "$ROOT/.build-backup/public-actions/track-actions.ts" "$ROOT/src/app/(public)/track/actions.ts" 2>/dev/null || true
# بازگردانی components
cp "$ROOT/.build-backup/request-wizard.tsx.bak" "$ROOT/src/components/request-wizard.tsx" 2>/dev/null || true
cp "$ROOT/.build-backup/track-form.tsx.bak" "$ROOT/src/components/track-form.tsx" 2>/dev/null || true
rm -rf "$ROOT/.build-backup"

if [ $BUILD_STATUS -ne 0 ]; then
  echo "✗ Build failed"
  exit 1
fi

echo ""
echo "✓ Build complete. Output: $ROOT/out"

# GitHub Pages: فایل .nojekyll برای غیرفعال کردن Jekyll (تا فایل‌های دارای _ در نام، ignore نشوند)
touch "$ROOT/out/.nojekyll"

ls -la "$ROOT/out" 2>/dev/null | head -10
