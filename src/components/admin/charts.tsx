"use client";

/**
 * نمودارهای SVG سبک برای پیشخوان مدیریت
 * ---------------------------------------------------------------
 * بدون وابستگی خارجی؛ نمودار سطحی، ستونی، حلقه‌ای و جرقه‌ای.
 * رنگ‌ها از پالت برند گرفته می‌شوند و در حالت تاریک نیز خوانا هستند.
 */
import { useId, useState } from "react";
import { fa, faNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface Point {
  label: string;
  value: number;
  color?: string;
}

/** نمودار سطحی با گرادیان و نقاط تعاملی */
export function AreaChart({
  data,
  height = 200,
  suffix = "",
  color = "#1e7a71",
}: {
  data: Point[];
  height?: number;
  suffix?: string;
  color?: string;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const padding = { top: 18, right: 12, bottom: 28, left: 12 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = (width - padding.left - padding.right) / Math.max(1, data.length - 1);
  const plotHeight = height - padding.top - padding.bottom;

  const points = data.map((point, index) => ({
    ...point,
    x: padding.left + index * stepX,
    y: padding.top + plotHeight - (point.value / max) * plotHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${padding.top + plotHeight} L${points[0]?.x ?? 0},${padding.top + plotHeight} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="نمودار روند درخواست‌ها">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* خطوط راهنما */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight * ratio}
            y2={padding.top + plotHeight * ratio}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 6"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hover === index ? 6 : 4}
              fill="var(--surface)"
              stroke={color}
              strokeWidth="2.5"
              className="transition-all"
            />
            <rect
              x={point.x - stepX / 2}
              y={padding.top}
              width={stepX}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-current text-[10px] font-bold"
              fillOpacity="0.55"
            >
              {point.label}
            </text>
            {hover === index && (
              <g>
                <rect
                  x={Math.min(Math.max(point.x - 38, 2), width - 78)}
                  y={Math.max(point.y - 40, 2)}
                  width="76"
                  height="26"
                  rx="9"
                  fill="var(--surface)"
                  stroke={color}
                  strokeOpacity="0.35"
                />
                <text
                  x={Math.min(Math.max(point.x, 40), width - 40)}
                  y={Math.max(point.y - 22, 20)}
                  textAnchor="middle"
                  className="fill-current text-[11px] font-black"
                >
                  {faNumber(point.value)}
                  {suffix}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** نمودار ستونی افقی یا عمودی */
export function BarsChart({ data, height = 190, horizontal = false }: { data: Point[]; height?: number; horizontal?: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <ul className="space-y-3">
        {data.map((point) => (
          <li key={point.label}>
            <div className="flex items-center justify-between gap-3 text-[0.76rem] font-bold">
              <span className="truncate text-ink-700 dark:text-ink-200">{point.label}</span>
              <span className="numeric shrink-0 text-ink-900 dark:text-white">{faNumber(point.value)}</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(point.value / max) * 100}%`, background: point.color ?? "#1e7a71" }}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((point) => (
        <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="numeric text-[0.7rem] font-black text-ink-600 opacity-0 transition group-hover:opacity-100 dark:text-ink-200">
            {faNumber(point.value)}
          </span>
          <div
            className="w-full rounded-t-xl transition-all duration-500"
            style={{
              height: `${Math.max(4, (point.value / max) * 100)}%`,
              background: point.color
                ? `linear-gradient(180deg, ${point.color}, ${point.color}88)`
                : "linear-gradient(180deg, #1e7a71, #48b3a5)",
            }}
          />
          <span className="truncate text-[0.62rem] font-bold text-ink-500 dark:text-ink-400">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

/** نمودار حلقه‌ای با راهنما */
export function DonutChart({
  data,
  size = 190,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  data: Point[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="نمودار سهم وضعیت‌ها">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth={thickness}
          />
          {data.map((item) => {
            const length = (item.value / total) * circumference;
            const circle = (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color ?? "#1e7a71"}
                strokeWidth={thickness}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="transition-all duration-700"
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="numeric text-2xl font-black text-ink-900 dark:text-white">{centerValue ?? faNumber(total)}</p>
            {centerLabel && <p className="text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">{centerLabel}</p>}
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-[0.78rem] font-bold">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: item.color ?? "#1e7a71" }} />
            <span className="text-ink-700 dark:text-ink-200">{item.label}</span>
            <span className="numeric ms-auto shrink-0 text-ink-900 dark:text-white">{faNumber(item.value)}</span>
            <span className="numeric shrink-0 text-ink-500 dark:text-ink-400">
              ({fa(Math.round((item.value / total) * 100))}٪)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** نمودار جرقه‌ای کوچک برای کارت‌های آماری */
export function Sparkline({ values, color = "#1e7a71", className }: { values: number[]; color?: string; className?: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const path = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 26;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
