"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** فهرست مطالب مقاله که از سرتیترهای سطح ۲ متن ساخته می‌شود */
export function ArticleToc({ body }: { body: string }) {
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(
    () =>
      body
        .split("\n")
        .map((line) => /^##\s+(.*)$/.exec(line.trim()))
        .filter((match): match is RegExpExecArray => Boolean(match))
        .map((match, index) => ({ id: `h-${index + 1}`, title: match[1].trim() })),
    [body],
  );

  useEffect(() => {
    if (headings.length === 0) return;
    const sections = headings
      .map((heading) => {
        const nodes = document.querySelectorAll("h2");
        return nodes[headings.indexOf(heading)];
      })
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.textContent ?? "");
        });
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-[0.84rem] font-black text-ink-900 dark:text-white">
        <Icon name="layers" size={17} className="text-brand-600 dark:text-brand-400" />
        فهرست مطالب
      </h3>
      <ol className="mt-3 space-y-2">
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-[0.74rem] font-bold leading-6 transition",
                activeId.includes(heading.title)
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-500/12 dark:text-brand-200"
                  : "text-ink-600 hover:bg-[var(--surface-muted)] hover:text-brand-700 dark:text-ink-300",
              )}
            >
              <span className="numeric mt-0.5 shrink-0 text-ink-400">{index + 1}.</span>
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** اشتراک‌گذاری مقاله (کپی نشانی + شبکه‌های اجتماعی) */
export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window === "undefined" ? `/articles/${slug}` : `${window.location.origin}/articles/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* بی‌صدا */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] px-3.5 py-2 text-[0.72rem] font-black text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
      >
        <Icon name={copied ? "check" : "copy"} size={15} />
        {copied ? "نشانی کپی شد" : "کپی نشانی"}
      </button>
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-300"
        aria-label="اشتراک در تلگرام"
      >
        <Icon name="telegram" size={16} />
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] text-ink-600 transition hover:border-brand-300 hover:text-brand-700 dark:text-ink-300"
        aria-label="اشتراک در واتس‌اپ"
      >
        <Icon name="whatsapp" size={16} />
      </a>
    </div>
  );
}
