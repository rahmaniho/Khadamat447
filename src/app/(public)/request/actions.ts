"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { submitRequest } from "@/lib/requests";
import { LAST_TRACKING_COOKIE } from "@/lib/request-cookie";
import { IS_STATIC } from "@/lib/static-data";

export type RequestActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
} | null;

/** ثبت درخواست از فرم چندمرحله‌ای؛ در صورت موفقیت، کد پیگیری در کوکی کوتاه‌مدت قرار می‌گیرد */
export async function submitRequestAction(_prev: RequestActionState, _formData: FormData): Promise<RequestActionState> {
  if (IS_STATIC) {
    return {
      ok: false,
      message: "این صفحه فقط نمایشی است. برای ثبت درخواست، لطفاً به نسخه‌ی کامل سایت مراجعه کنید یا با دفتر تماس بگیرید.",
    };
  }
  const result = await submitRequest(_formData);
  if (!result.ok) return { ok: false, message: result.message, errors: result.errors };

  const store = await cookies();
  store.set(LAST_TRACKING_COOKIE, result.trackingCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60,
  });
  redirect("/request/success");
}
