import { requirePermission } from "@/lib/auth/guard";
import { listUsers } from "@/lib/queries";
import { PageHeader, Card, btn } from "@/components/admin/ui";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Field, inputClass } from "@/components/field";
import { ROLES, ROLE_KEYS } from "@/lib/constants";
import { createUserAction, updateUserAction, resetPasswordAction } from "@/app/admin/_actions/users";
import { formatFaDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "کاربران مدیر" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  await requirePermission("users.manage");
  const me = await getSessionUser();
  const sp = await searchParams;
  const users = await listUsers();
  return (
    <div className="space-y-6">
      <PageHeader title="کاربران مدیر و نقش‌ها" desc="هر نقش فقط به بخش‌های مرتبط با خود دسترسی دارد. نقش‌ها: مدیر کل، کارمند بررسی درخواست، مدیر محتوا." />
      <Flash msg={sp.msg} err={sp.err} />

      <Card title="نقش‌ها و دسترسی‌ها">
        <ul className="grid gap-3 md:grid-cols-3">
          {ROLE_KEYS.map((r) => (
            <li key={r} className="rounded-2xl bg-slate-50 p-4 text-sm leading-7">
              <p className="font-extrabold">{ROLES[r].label}</p>
              <p className="text-slate-600">{ROLES[r].description}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="افزودن کاربر">
        <form action={createUserAction} className="grid gap-4 md:grid-cols-2">
          <Field label="نام و نام خانوادگی" name="name" required><input id="name" name="name" required maxLength={120} className={inputClass} /></Field>
          <Field label="ایمیل ورود" name="email" required><input id="email" name="email" type="email" dir="ltr" required className={`${inputClass} text-left`} /></Field>
          <Field label="نقش" name="role" required>
            <select id="role" name="role" className={inputClass} defaultValue="reviewer">
              {ROLE_KEYS.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
            </select>
          </Field>
          <Field label="رمز عبور اولیه" name="password" required hint="حداقل ۱۰ نویسه با حروف لاتین و عدد. کاربر در ورود اول باید آن را تغییر دهد.">
            <input id="password" name="password" type="password" dir="ltr" required minLength={10} autoComplete="new-password" className={`${inputClass} text-left`} />
          </Field>
          <div className="md:col-span-2"><button type="submit" className={btn.primary}>ایجاد کاربر</button></div>
        </form>
      </Card>

      <Card title={`کاربران (${users.length})`}>
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr><th className="px-2 py-3">نام</th><th className="px-2 py-3">ایمیل</th><th className="px-2 py-3">نقش</th><th className="px-2 py-3">وضعیت</th><th className="px-2 py-3">آخرین ورود</th><th className="px-2 py-3">عملیات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="align-top">
                  <td className="px-2 py-3 font-bold">{u.name} {me?.id === u.id && <span className="text-xs text-brand-700">(شما)</span>}</td>
                  <td className="px-2 py-3 ltr-num" dir="ltr">{u.email}</td>
                  <td className="px-2 py-3">
                    <form action={updateUserAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} aria-label={`نقش ${u.name}`} className="rounded-xl border border-slate-300 px-2 py-2 text-sm">
                        {ROLE_KEYS.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                      </select>
                      <button type="submit" className={btn.ghost}>ذخیره</button>
                    </form>
                  </td>
                  <td className="px-2 py-3">{u.active ? "فعال" : "غیرفعال"}{u.must_change_password ? <span className="block text-xs text-amber-700">نیاز به تغییر رمز</span> : null}</td>
                  <td className="px-2 py-3 text-xs">{formatFaDate(u.last_login_at)}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-col gap-2">
                      {me?.id !== u.id && (
                        <ConfirmForm action={updateUserAction} message={u.active ? "این کاربر غیرفعال شود و نشست‌هایش بسته شوند؟" : "این کاربر فعال شود؟"}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="role" value={u.role} />
                          <input type="hidden" name="toggleActive" value="1" />
                          <button type="submit" className={btn.ghost}>{u.active ? "غیرفعال‌سازی" : "فعال‌سازی"}</button>
                        </ConfirmForm>
                      )}
                      <form action={resetPasswordAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <input name="password" type="password" dir="ltr" minLength={10} required placeholder="رمز موقت" aria-label={`رمز موقت برای ${u.name}`} className="w-32 rounded-xl border border-slate-300 px-2 py-2 text-sm" />
                        <button type="submit" className={btn.ghost}>بازنشانی رمز</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
