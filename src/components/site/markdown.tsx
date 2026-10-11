import React from "react";
import { cn } from "@/lib/cn";

/**
 * نمایش‌دهنده سبک مارک‌داون
 * ---------------------------------------------------------------
 * بدون وابستگی خارجی: سرتیتر، فهرست، نقل‌قول، متن پررنگ، پیوند و
 * پاراگراف را پشتیبانی می‌کند — دقیقاً همان چیزی که محتوای سایت
 * استفاده می‌کند (متن ورودی در پنل مدیریت نیز به همین شکل نگه‌داری
 * می‌شود تا انتقال به دیتابیس ساده باشد).
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-black text-ink-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c-${i}`} className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            className="font-bold text-brand-700 underline underline-offset-4 dark:text-brand-300"
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>,
        );
      }
    }
    lastIndex = match.index + token.length;
    i += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const lines = (source || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];
  let quote: string[] = [];
  let key = 0;
  /* شمارنده سرتیترهای سطح ۲ — لنگرهای `h-1`، `h-2` و … که فهرست مطالب
     مقاله (ArticleToc) به آن‌ها پیوند می‌دهد. بدون این idها پیوندهای
     فهرست مطالب به هیچ مقصدی نمی‌رسیدند. */
  let h2Count = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(paragraph.join(" "), `p-${key}`)}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l-${key++}`}>
        {list.items.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${key}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push(<blockquote key={`q-${key++}`}>{renderInline(quote.join(" "), `q-${key}`)}</blockquote>);
    quote = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = heading[1].length;
      const Tag = (level === 2 ? "h2" : level === 3 ? "h3" : "h4") as "h2" | "h3" | "h4";
      const headingKey = `h-${key++}`;
      /* فقط سرتیترهای سطح ۲ لنگر شماره‌دار می‌گیرند — دقیقاً هم‌ترتیب با
         فهرست مطالب (h-1 برای نخستین `##` و به همین ترتیب) */
      const anchorId = level === 2 ? `h-${++h2Count}` : undefined;
      blocks.push(
        <Tag key={headingKey} {...(anchorId ? { id: anchorId } : {})}>
          {renderInline(heading[2], headingKey)}
        </Tag>,
      );
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^\s*>\s?/, ""));
      continue;
    }

    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      flushQuote();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    if (/^\s*(---|___|\*\*\*)\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(<hr key={`hr-${key++}`} />);
      continue;
    }

    if (quote.length) {
      quote.push(line);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushQuote();

  return <div className={cn("prose-fa", className)}>{blocks}</div>;
}
