import QRCode from "qrcode";
import { loadSite, mapsUrl } from "@/lib/site";

/** QR واقعی برای لینک مسیریابی دفتر (فقط نشانی رسمی تنظیمات، بدون پارامتر ورودی آزاد) */
export async function GET() {
  const site = await loadSite();
  const buffer = await QRCode.toBuffer(mapsUrl(site), { type: "png", margin: 2, width: 512, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
