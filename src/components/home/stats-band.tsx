"use client";

import { Icon } from "@/components/icons";
import { Counter } from "@/components/ui/overlay";
import { cn } from "@/lib/cn";
import { toFaDigits } from "@/lib/digits";

const STATS = [
  { value: 5, suffix: "", label: "خدمت با فرم اختصاصی", icon: "services", tone: "brand" },
  { value: 13, suffix: "", label: "راهنمای آموزشی و مقاله", icon: "book", tone: "info" },
  { value: 100, suffix: "٪", label: "پیگیری با کد یکتا", icon: "track", tone: "gold" },
  { value: 24, suffix: " ساعته", label: "دسترسی به فرم آنلاین", icon: "clock", tone: "success" },
];

export function StatsBand() {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="surface-card lift relative overflow-hidden p-5 text-center"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className={cn("mx-auto grid h-12 w-12 place-items-center rounded-2xl", tones[stat.tone])}>
            <Icon name={stat.icon} size={23} />
          </span>
          <p className="mt-4 text-3xl font-black text-ink-900 dark:text-white">
            <Counter value={stat.value} suffix={toFaDigits(stat.suffix)} />
          </p>
          <p className="mt-1.5 text-[0.78rem] font-bold text-ink-500 dark:text-ink-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
