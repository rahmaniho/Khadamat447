"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { loginAction, type LoginState } from "@/app/admin/_actions/auth";
import { Field, inputClass } from "@/components/field";
import { Alert } from "@/components/ui";

/** فرم ورود: ایمیل پس از خطا حفظ می‌شود و فقط رمز عبور پاک می‌شود */
export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);
  const [email, setEmail] = useState("");
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state && !state.ok && pwRef.current) pwRef.current.value = "";
  }, [state]);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {state && !state.ok && <Alert tone="error">{state.error}</Alert>}
      <Field label="ایمیل" name="email" required>
        <input id="email" name="email" type="email" dir="ltr" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} text-left`} />
      </Field>
      <Field label="رمز عبور" name="password" required>
        <input ref={pwRef} id="password" name="password" type="password" dir="ltr" required autoComplete="current-password" className={`${inputClass} text-left`} />
      </Field>
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-brand-700 px-6 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-70">
        {pending ? "در حال بررسی…" : "ورود"}
      </button>
    </form>
  );
}
