"use server";

import { findRequestForTracking, type PublicRequestView } from "@/lib/tracking";
import { trackingSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, ipHash } from "@/lib/requests";
import { logSecurity } from "@/lib/logger";
import { ensureBootstrap } from "@/lib/bootstrap";

export type TrackState = { ok: boolean; message?: string; result?: PublicRequestView | null } | null;

/** پیگیری درخواست: فقط با کد پیگیری و چهار رقم آخر شماره تماس؛ اطلاعات شخصی هرگز نمایش داده نمی‌شود */
export async function trackRequestAction(_prev: TrackState, formData: FormData): Promise<TrackState> {
  await ensureBootstrap();
  const ip = await clientIp();
  const rl = rateLimit(`track:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return { ok: false, message: "تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید." };

  const parsed = trackingSchema.safeParse({
    trackingCode: formData.get("trackingCode"),
    verification: formData.get("verification"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "اطلاعات را کامل وارد کنید." };

  const result = await findRequestForTracking(parsed.data.trackingCode, parsed.data.verification);
  if (!result) {
    logSecurity("تلاش ناموفق برای پیگیری درخواست", { ip: ipHash(ip) });
    return { ok: false, message: "درخواستی با این مشخصات پیدا نشد. کد پیگیری و چهار رقم آخر شماره تماس را بررسی کنید." };
  }
  return { ok: true, result };
}
