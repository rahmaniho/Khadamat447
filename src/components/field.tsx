export const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-100";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-slate-800">
        {label}
        {required ? <span className="mr-1 text-rose-600" aria-hidden>*</span> : <span className="mr-2 text-xs font-normal text-slate-500">(اختیاری)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-6 text-slate-500">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
