"use client";

/**
 * اجزای فرم
 * ---------------------------------------------------------------
 * ورودی‌های استاندارد با پشتیبانی کامل از RTL، حالت تاریک، پیام راهنما،
 * خطا و وضعیت الزامی. اعداد ورودی به‌صورت خودکار به ارقام لاتین تبدیل
 * می‌شوند تا اعتبارسنجی دقیق باشد.
 */
import React, { useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { en } from "@/lib/format";

/* اندازه فونت در موبایل ۱۶px است (text-base) چون iOS Safari هنگام فوکوس
   روی ورودی کوچک‌تر از ۱۶px صفحه را زوم می‌کند و چیدمان به‌هم می‌ریزد؛
   در دسکتاپ همان ظاهر فشرده قبلی (text-sm) حفظ می‌شود. */
const FIELD_BASE =
  "w-full rounded-2xl border bg-white px-4 text-base font-medium text-ink-900 transition-all duration-200 placeholder:font-normal placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 disabled:cursor-not-allowed disabled:bg-ink-50 sm:text-sm dark:bg-white/5 dark:text-white dark:placeholder:text-ink-500 dark:hover:border-white/25 dark:focus:border-brand-400";

export function Field({
  label,
  help,
  error,
  required,
  children,
  htmlFor,
  optionalText = "اختیاری",
  className,
}: {
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  optionalText?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center gap-2 text-[0.82rem] font-bold text-ink-800 dark:text-ink-100">
          {label}
          {required ? (
            <span className="text-rose-500" aria-hidden>
              *
            </span>
          ) : (
            <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-ink-500 dark:bg-white/10 dark:text-ink-400">
              {optionalText}
            </span>
          )}
        </label>
      )}
      {children}
      {help && !error && <p className="text-[0.72rem] leading-6 text-ink-500 dark:text-ink-400">{help}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-[0.72rem] font-bold text-rose-600 dark:text-rose-400">
          <Icon name="alertCircle" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  help?: string;
  error?: string;
  icon?: string;
  numeric?: boolean;
  options?: never;
}

export function Input({ label, help, error, icon, numeric, className, id, required, ...rest }: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field label={label} help={help} error={error} required={required} htmlFor={fieldId}>
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            size={18}
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500"
          />
        )}
        <input
          {...rest}
          id={fieldId}
          required={required}
          onChange={(e) => {
            if (numeric) e.target.value = en(e.target.value);
            rest.onChange?.(e);
          }}
          className={cn(
            FIELD_BASE,
            "h-12",
            icon && "pe-11",
            numeric && "numeric text-start",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15",
            className,
          )}
        />
      </div>
    </Field>
  );
}

export function Textarea({
  label,
  help,
  error,
  className,
  id,
  required,
  rows = 4,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; help?: string; error?: string }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field label={label} help={help} error={error} required={required} htmlFor={fieldId}>
      <textarea
        {...rest}
        id={fieldId}
        rows={rows}
        required={required}
        className={cn(FIELD_BASE, "resize-y py-3 leading-8", error && "border-rose-400", className)}
      />
    </Field>
  );
}

export function Select({
  label,
  help,
  error,
  options,
  placeholder,
  className,
  id,
  required,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  help?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field label={label} help={help} error={error} required={required} htmlFor={fieldId}>
      <div className="relative">
        <select
          {...rest}
          id={fieldId}
          required={required}
          className={cn(FIELD_BASE, "h-12 appearance-none pe-4 ps-11 cursor-pointer", error && "border-rose-400", className)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-400" />
      </div>
    </Field>
  );
}

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  error,
  className,
  id,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
  id?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={fieldId} className="flex cursor-pointer items-start gap-3 text-sm leading-7">
        <span className="relative mt-0.5">
          <input
            id={fieldId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "grid h-5.5 w-5.5 place-items-center rounded-lg border-2 transition-all duration-200",
              checked
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-300 bg-white group-hover:border-brand-400 dark:border-white/25 dark:bg-white/5",
            )}
            style={{ height: "1.375rem", width: "1.375rem" }}
          >
            {checked && <Icon name="check" size={13} strokeWidth={3} />}
          </span>
        </span>
        <span className="min-w-0">
          <span className="font-bold text-ink-800 dark:text-ink-100">{label}</span>
          {description && <span className="mt-0.5 block text-[0.76rem] leading-6 text-ink-500 dark:text-ink-400">{description}</span>}
        </span>
      </label>
      {error && <p className="text-[0.72rem] font-bold text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  help,
  columns = 1,
}: {
  label?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  columns?: 1 | 2 | 3;
}) {
  const name = useId();
  return (
    <Field label={label} help={help}>
      <div
        className={cn(
          "grid gap-2.5",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        )}
        role="radiogroup"
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-sm transition-all duration-200",
                active
                  ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/15 dark:border-brand-400/60 dark:bg-brand-500/10"
                  : "border-ink-200 bg-white hover:border-brand-300 dark:border-white/12 dark:bg-white/5 dark:hover:border-brand-400/40",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all",
                  active ? "border-brand-600" : "border-ink-300 dark:border-white/25",
                )}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink-800 dark:text-ink-100">{o.label}</span>
                {o.description && <span className="mt-0.5 block text-[0.72rem] text-ink-500 dark:text-ink-400">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-4", disabled && "opacity-60")}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-bold text-ink-800 dark:text-ink-100">{label}</span>}
          {description && <span className="mt-0.5 block text-[0.72rem] leading-6 text-ink-500 dark:text-ink-400">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-brand-600" : "bg-ink-300 dark:bg-white/20",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300",
            checked ? "start-1" : "start-6",
          )}
        />
      </button>
    </label>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: Array<{ value: string; label: string; icon?: string }>;
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-1",
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl font-bold transition-all duration-250",
              size === "sm" ? "px-3 py-1.5 text-[0.74rem]" : "px-4 py-2 text-[0.82rem]",
              active
                ? "bg-white text-brand-800 shadow-soft dark:bg-white/12 dark:text-white"
                : "text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white",
            )}
          >
            {o.icon && <Icon name={o.icon} size={15} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "جست‌وجو…",
  className,
  autoFocus,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon name="search" size={18} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(FIELD_BASE, "h-12 pe-11 ps-4")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute start-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10"
          aria-label="پاک کردن جست‌وجو"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * بارگذاری فایل
 * ------------------------------------------------------------------ */

export interface FilePickerError {
  name: string;
  reason: string;
}

export function FileDrop({
  onFiles,
  accept,
  maxSizeMb,
  maxFiles,
  currentCount,
  multiple = true,
  errors,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  maxSizeMb: number;
  maxFiles: number;
  currentCount: number;
  multiple?: boolean;
  errors?: FilePickerError[];
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, maxFiles - currentCount);
  const acceptLabel = useMemo(
    () =>
      accept
        .split(",")
        .map((e) => e.trim().replace(".", "").toUpperCase())
        .join(" · "),
    [accept],
  );

  const handle = (list: FileList | null) => {
    if (!list) return;
    onFiles(Array.from(list).slice(0, remaining || maxFiles));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-9 text-center transition-all duration-300",
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-ink-200 bg-[var(--surface-muted)]/60 hover:border-brand-300 dark:border-white/15",
          remaining === 0 && "pointer-events-none opacity-60",
        )}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft dark:bg-white/8 dark:text-brand-300">
          <Icon name="upload" size={26} />
        </span>
        <div>
          <p className="font-black text-ink-900 dark:text-white">
            {remaining === 0 ? "سقف تعداد فایل تکمیل است" : "فایل‌ها را به اینجا بکشید یا انتخاب کنید"}
          </p>
          <p className="mt-1 text-xs leading-6 text-ink-500 dark:text-ink-400">
            قالب‌های مجاز: {acceptLabel} — حداکثر {maxSizeMb} مگابایت برای هر فایل — {remaining} فایل دیگر مجاز است
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 text-sm font-bold text-brand-700 transition hover:bg-brand-50 dark:border-brand-400/30 dark:bg-white/5 dark:text-brand-200"
        >
          <Icon name="image" size={17} />
          انتخاب فایل
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handle(e.target.files)}
        />
      </div>
      {errors && errors.length > 0 && (
        <ul className="space-y-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[0.72rem] font-bold text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
          {errors.map((err, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <Icon name="alertCircle" size={13} />
              {err.name}: {err.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
