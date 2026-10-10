/**
 * تبدیل ساده Markdown به HTML امن
 * - HTML خام پشتیبانی نمی‌شود و همه متن‌ها escape می‌شوند (جلوگیری از XSS)
 * - فقط لینک‌های http(s) و مسیرهای داخلی پذیرفته می‌شوند
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(url: string): string | null {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (/^mailto:/i.test(u)) return u;
  return null;
}

function inline(text: string): string {
  let out = esc(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const raw = href.replace(/&amp;/g, "&");
    const safe = safeHref(raw);
    if (!safe) return label;
    const external = /^https?:/i.test(safe);
    return `<a href="${esc(safe)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  return out;
}

export function renderMarkdown(src: string): string {
  const lines = (src || "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let list: "ul" | "ol" | null = null;
  let para: string[] = [];
  let quote: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      quote = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      flushQuote();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      flushQuote();
      const level = Math.min(h[1].length + 1, 4); // ‌## -> h3 (h1 محفوظ برای عنوان صفحه)
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]);
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      flushQuote();
      const kind = ul ? "ul" : "ol";
      if (list !== kind) {
        flushList();
        list = kind;
        html.push(`<${kind}>`);
      }
      html.push(`<li>${inline((ul || ol)![1])}</li>`);
      continue;
    }
    flushList();
    flushQuote();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  flushQuote();
  return html.join("\n");
}

export function stripMarkdown(src: string): string {
  return (src || "")
    .replace(/\*\*|__|`/g, "")
    .replace(/[#>*_\-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * استخراج پرسش و پاسخ از بخش «پرسش‌های متداول» یک مقاله.
 * هر عنوان «### پرسش» در زیر بخشی که نامش «پرسش» دارد، یک جفت پرسش و پاسخ است.
 */
export function extractFaqPairs(src: string): Array<{ question: string; answer: string }> {
  const out: Array<{ question: string; answer: string }> = [];
  let inFaq = false;
  let cur: { question: string; answer: string } | null = null;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (/^##\s+/.test(line)) {
      inFaq = /پرسش/.test(line);
      cur = null;
      continue;
    }
    if (!inFaq) continue;
    if (/^###\s+/.test(line)) {
      cur = { question: line.replace(/^###\s+/, "").trim(), answer: "" };
      out.push(cur);
      continue;
    }
    if (cur && line) cur.answer += (cur.answer ? " " : "") + line;
  }
  return out
    .map((f) => ({ question: f.question, answer: stripMarkdown(f.answer) }))
    .filter((f) => f.question && f.answer);
}
