import { buildLlmsText } from "@/lib/content/llms";

/**
 * مسیر llms.txt — فایل ماشین‌خوان برای دستیارهای هوش مصنوعی و
 * موتورهای جست‌وجوی مولد (GEO). خروجی ایستا است تا در استقرار
 * سروری و Static Export یکسان کار کند.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsText(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
