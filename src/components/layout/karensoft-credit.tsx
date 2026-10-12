"use client";

import React, { useEffect, useRef, useState } from "react";
import { activeBasePath, withBasePath } from "@/lib/basepath";
import { cn } from "@/lib/cn";
import { FOOTER_I18N } from "@/lib/content/site";

const KARENSOFT_URL = "https://www.karen-soft.ir";

const MARK = "/images/karensoft/mark.png";
const WORD_FA = "/images/karensoft/wordmark-fa.png";
const WORD_EN = "/images/karensoft/wordmark-en.png";

const PIXELS = [
  { x: -27, y: 4, s: 4, d: 0 },
  { x: -22, y: 10, s: 3, d: 0.5 },
  { x: -31, y: 12, s: 3, d: 1 },
  { x: -19, y: 16, s: 2.5, d: 1.5 },
] as const;

/**
 * نوار درخشان متحرک روی حروف نام کارن سافت (TextShine).
 * با ماسک همان تصویر، درخشش فقط روی خود حروف دیده می‌شود.
 */
function TextShine({ src, delay, basePath }: { src: string; delay: string; basePath: string }) {
  const url = `url(${withBasePath(src, basePath)})`;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    >
      <span className="ks-text-shine absolute inset-y-0 left-0 w-1/2" style={{ animationDelay: delay }} />
    </span>
  );
}

/**
 * نشان متحرک «طراحی و توسعه: کارن سافت | KarenSoft» در نوار پایینی فوتر.
 */
export function KarenSoftCredit({
  basePath = activeBasePath(),
  lang,
}: {
  basePath?: string;
  lang?: "fa" | "en";
}) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [locale, setLocale] = useState<"fa" | "en">(lang ?? "fa");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  /* همگام‌سازی زبان با ویژگی lang/dir روی <html> یا پراپ ورودی */
  useEffect(() => {
    if (lang) {
      setLocale(lang);
      return;
    }
    const syncLocale = () => {
      const htmlLang = (document.documentElement.lang || "fa").toLowerCase();
      const htmlDir = (document.documentElement.dir || "rtl").toLowerCase();
      if (htmlLang.startsWith("en") || htmlDir === "ltr") {
        setLocale("en");
      } else {
        setLocale("fa");
      }
    };
    syncLocale();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(syncLocale);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"],
    });
    return () => observer.disconnect();
  }, [lang]);

  /* احترام به prefers-reduced-motion و فعال‌سازی انیمیشن ورود با IntersectionObserver */
  useEffect(() => {
    const node = linkRef.current;
    if (!node || typeof window === "undefined") return;

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const prefersReduced = media ? media.matches : false;
    setReduceMotion(prefersReduced);

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setMotionReady(false);
      setIsVisible(true);
    } else {
      setMotionReady(true);
      setIsVisible(false);
    }

    let io: IntersectionObserver | null = null;
    if (!prefersReduced && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      io.observe(node);
    }

    const onMediaChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
      if (event.matches) {
        io?.disconnect();
        setMotionReady(false);
        setIsVisible(true);
      }
    };

    media?.addEventListener?.("change", onMediaChange);
    return () => {
      io?.disconnect();
      media?.removeEventListener?.("change", onMediaChange);
    };
  }, []);

  const motionOn = !reduceMotion;
  const designedBy = FOOTER_I18N[locale].footer.designedBy;
  const labelWords = designedBy.split(" ");
  const ariaLabel = `${designedBy} کارن سافت | KarenSoft — www.karen-soft.ir`;

  return (
    <a
      ref={linkRef}
      href={KARENSOFT_URL}
      target="_blank"
      rel="noopener noreferrer"
      dir={locale === "en" ? "ltr" : "rtl"}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "ks-credit group inline-flex flex-col items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:flex-row sm:gap-3",
        motionOn && motionReady && "ks-credit--motion-ready",
        isVisible && "is-visible",
      )}
    >
      {/* برچسب: واژه‌ها به ترتیب بالا می‌آیند و گرادیان پیوسته روی آن‌ها جریان دارد */}
      <span
        lang={locale}
        dir={locale === "en" ? "ltr" : "rtl"}
        className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide"
      >
        {labelWords.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="ks-label-gradient ks-label-word inline-block"
            style={
              motionOn
                ? {
                    animationDelay: `${i * 0.15}s`,
                    transitionDelay: `${0.1 + i * 0.12}s`,
                  }
                : undefined
            }
          >
            {word}
          </span>
        ))}
      </span>

      {/* کارت با حاشیه گرادیان چرخان */}
      <span className="ks-card-border relative inline-flex overflow-hidden rounded-2xl p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_0_30px_-4px_rgba(34,211,238,0.6)]">
        <span
          aria-hidden="true"
          className="ks-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2"
        />

        <span
          dir="ltr"
          className="relative flex items-center gap-3 overflow-hidden rounded-[14px] bg-white py-2 pl-2.5 pr-3.5"
        >
          {/* نوار نور عبوری روی کارت */}
          <span
            aria-hidden="true"
            className="ks-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-sky-100/80 to-transparent"
          />

          {/* نشان KS و انیمیشن‌های پیرامونی */}
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            {motionOn && (
              <>
                <span aria-hidden="true" className="ks-ripple absolute inset-1 rounded-full border border-sky-400/70" />
                <span
                  aria-hidden="true"
                  className="ks-ripple absolute inset-1 rounded-full border border-blue-500/60"
                  style={{ animationDelay: "1.2s" }}
                />
              </>
            )}

            <span aria-hidden="true" className="ks-logo-ring absolute inset-0 rounded-full" />

            {motionOn && (
              <span aria-hidden="true" className="ks-orbit absolute inset-0">
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.85)]" />
              </span>
            )}

            <span aria-hidden="true" className="absolute inset-[5px] rounded-full bg-gradient-to-br from-sky-50 to-white" />

            <span className="ks-mark relative block h-9 w-9">
              {motionOn &&
                PIXELS.map((p, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="ks-pixel absolute rounded-[1px] bg-blue-600"
                    style={
                      {
                        width: p.s,
                        height: p.s,
                        left: "50%",
                        top: "50%",
                        animationDelay: `${p.d}s`,
                        "--px-x": `${p.x}px`,
                        "--px-y": `${p.y}px`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              <img
                src={withBasePath(MARK, basePath)}
                alt=""
                width={256}
                height={256}
                loading="lazy"
                className={cn("relative h-full w-full object-contain", motionOn && "ks-float")}
              />
            </span>
          </span>

          <span aria-hidden="true" className="h-9 w-px bg-gradient-to-b from-transparent via-sky-300 to-transparent" />

          {/* نوشتارهای کارن سافت / KarenSoft */}
          <span className="flex flex-col items-center gap-1">
            <span className="ks-wordmark--fa relative block">
              <img
                src={withBasePath(WORD_FA, basePath)}
                alt="کارن سافت"
                width={383}
                height={96}
                loading="lazy"
                className="block h-6 w-auto max-w-none"
              />
              {motionOn && <TextShine src={WORD_FA} delay="1.4s" basePath={basePath} />}
            </span>
            <span className="ks-wordmark--en relative block">
              <img
                src={withBasePath(WORD_EN, basePath)}
                alt="KarenSoft"
                width={410}
                height={48}
                loading="lazy"
                className="block h-[11px] w-auto max-w-none"
              />
              {motionOn && <TextShine src={WORD_EN} delay="1.9s" basePath={basePath} />}
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}
