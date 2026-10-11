#!/usr/bin/env python3
"""
اصلاح مسیر دارایی‌ها برای خروجی استاتیک زیر basePath
---------------------------------------------------------------
در حالت `output: export` برخی ارجاع‌ها (تصاویر <img>، آیکون‌ها و
manifest) با basePath پیشوند نمی‌شوند. این اسکریپت کویرک را جبران
می‌کند تا سایت روی GitHub Pages (پروژه در /Khadamat447/) بی‌نقص کار کند.

اجرا (به‌صورت خودکار در scripts/build-static.sh):
    python3 scripts/fix-basepath.py out /Khadamat447
"""
import json
import pathlib
import sys

ASSET_DIRS = ("/images/", "/brand/", "/fonts/")
ASSET_FILES = ("/icon.png", "/apple-icon.png", "/manifest.webmanifest")

TEXT_SUFFIXES = {".html", ".txt", ".json", ".js", ".css", ".webmanifest", ".xml"}


def fix_text(text: str, base: str) -> tuple[str, int]:
    count = 0
    for token in ASSET_DIRS + ASSET_FILES:
        # فقط مسیرهای مطلقِ بدون پیشوند را اصلاح می‌کنیم
        for quote in ('"', "'", "(", "="):
            src = f"{quote}{token}"
            dst = f"{quote}{base}{token}"
            if src in text:
                count += text.count(src)
                text = text.replace(src, dst)
        # حالت escape‌شده در بارهای RSC/JS: \"/images/
        src_esc = '\\"' + token
        dst_esc = '\\"' + base + token
        if src_esc in text:
            count += text.count(src_esc)
            text = text.replace(src_esc, dst_esc)
    return text, count


def fix_manifest(path: pathlib.Path, base: str) -> bool:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return False
    changed = False
    for key in ("start_url", "scope"):
        value = data.get(key)
        if isinstance(value, str) and value.startswith("/") and not value.startswith(base):
            data[key] = base + value if value != "/" else f"{base}/"
            changed = True
    for icon in data.get("icons", []) or []:
        src = icon.get("src")
        if isinstance(src, str) and src.startswith("/") and not src.startswith(base):
            icon["src"] = base + src
            changed = True
    if changed:
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return changed


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: fix-basepath.py <dir> <basePath>")
        return 2
    root = pathlib.Path(sys.argv[1])
    base = sys.argv[2].rstrip("/")
    if not root.exists():
        print(f"✗ پوشه پیدا نشد: {root}")
        return 1

    total = 0
    files = 0
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.name == "manifest.webmanifest":
            if fix_manifest(path, base):
                total += 1
                files += 1
            continue
        if path.suffix not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        if base in text and not any(t in text for t in ASSET_DIRS + ASSET_FILES):
            continue
        fixed, count = fix_text(text, base)
        if count:
            path.write_text(fixed, encoding="utf-8")
            total += count
            files += 1

    print(f"✓ اصلاح basePath: {total} ارجاع در {files} فایل (basePath={base})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
