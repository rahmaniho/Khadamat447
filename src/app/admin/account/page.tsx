import { requireUser } from "@/lib/auth/guard";
import { Flash } from "@/components/admin/flash";
import { PageHeader, Card } from "@/components/admin/ui";
import { Field, inputClass } from "@/components/field";
import { changePasswordAction } from "../_actions/auth";

export const metadata = { title: "حساب کاربری" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  const user = await requireUser({ allowPasswordChange: true });
  const { msg, err } = await searchParams;
  return (
    <div className="space-y-6">
      <PageHeader title="حساب کاربری" desc={`${user.name} · ${user.email}`} />
      <Flash msg={msg} err={err} />
      {user.mustChangePassword && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">رمز عبور اولیه شما باید تغییر کند تا بتوانید ادامه دهید.</p>
      )}
      <Card title="تغییر رمز عبور">
        <form action={changePasswordAction} className="grid max-w-lg gap-5">
          <Field label="رمز عبور فعلی" name="currentPassword" required>
            <input id="currentPassword" name="currentPassword" type="password" dir="ltr" required autoComplete="current-password" className={`${inputClass} text-left`} />
          </Field>
          <Field label="رمز عبور جدید" name="newPassword" required hint="حداقل ۱۰ نویسه، شامل حروف لاتین و عدد.">
            <input id="newPassword" name="newPassword" type="password" dir="ltr" required minLength={10} autoComplete="new-password" className={`${inputClass} text-left`} />
          </Field>
          <Field label="تکرار رمز عبور جدید" name="confirmPassword" required>
            <input id="confirmPassword" name="confirmPassword" type="password" dir="ltr" required minLength={10} autoComplete="new-password" className={`${inputClass} text-left`} />
          </Field>
          <button type="submit" className="justify-self-start rounded-2xl bg-brand-700 px-6 py-3 font-bold text-white hover:bg-brand-800">ذخیره رمز جدید</button>
        </form>
      </Card>
    </div>
  );
}
