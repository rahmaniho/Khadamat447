import { Icon } from "@/components/icons";

/** فرم جست‌وجو با GET (بدون نیاز به JavaScript) */
export function SearchBox({ action, defaultValue = "", placeholder = "جست‌وجو در مقالات و سؤالات…" }: { action: string; defaultValue?: string; placeholder?: string }) {
  return (
    <form role="search" action={action} method="get" className="relative">
      <label htmlFor="q" className="sr-only">جست‌وجو</label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={100}
        className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pr-12 pl-28 text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
        <Icon name="search" size={20} />
      </span>
      <button type="submit" className="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
        جست‌وجو
      </button>
    </form>
  );
}
