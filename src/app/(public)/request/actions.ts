"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { submitRequest } from "@/lib/requests";
import { LAST_TRACKING_COOKIE } from "@/lib/request-cookie";

export type RequestActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
} | null;

/** ثبت درخواست از فرم چندمرحله‌ای؛ در صورت موفقیت، کد پیگیری در کوکی کوتاه‌مدت قرار می‌گیرد */
export async function submitRequestAction(_prev: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const result = await submitRequest(formData);
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
