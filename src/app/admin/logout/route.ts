import { redirect } from "next/navigation";
import { logoutAction } from "../_actions/auth";

/** خروج فقط با درخواست همان مبدأ (جلوگیری از CSRF) */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return new Response("Forbidden", { status: 403 });
  }
  await logoutAction();
  redirect("/admin/login");
}
