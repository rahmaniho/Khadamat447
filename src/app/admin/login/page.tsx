import { Icon } from "@/components/icons";
import { LoginForm } from "@/components/admin/login-form";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ensureBootstrap } from "@/lib/bootstrap";

export const metadata = { title: "ورود به پنل مدیریت" };

export default async function AdminLoginPage() {
  await ensureBootstrap();
  if (await getSessionUser()) redirect("/admin");
  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white">
            <Icon name="lock" size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-black">ورود به پنل مدیریت</h1>
          <p className="mt-2 text-sm text-slate-600">این بخش ویژه کارکنان مجاز دفتر است.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <LoginForm />
          <p className="mt-5 text-center text-xs leading-6 text-slate-500">پس از چند تلاش ناموفق، ورود برای مدتی محدود می‌شود. حساب کاربری را از مدیر کل دریافت کنید.</p>
        </div>
      </div>
    </main>
  );
}
