import { renderMarkdown } from "@/lib/markdown";

/** نمایش Markdown امن (بدون HTML خام) */
export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  return <div className={`prose-fa ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />;
}
