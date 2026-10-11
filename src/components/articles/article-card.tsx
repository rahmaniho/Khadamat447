import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { fa, formatDate } from "@/lib/format";
import type { ArticleView } from "@/lib/content";

export function ArticleCard({ article, variant = "default" }: { article: ArticleView; variant?: "default" | "wide" | "compact" }) {
  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.slug}`} className="group flex gap-3 rounded-2xl p-2 transition hover:bg-[var(--surface-muted)]">
        <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
          <Image src={article.cover} alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-105" />
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 text-[0.78rem] font-black leading-6 text-ink-800 group-hover:text-brand-700 dark:text-ink-100">
            {article.title}
          </span>
          <span className="mt-1 flex items-center gap-2 text-[0.64rem] font-bold text-ink-500 dark:text-ink-400">
            <Icon name="clock" size={12} />
            {fa(article.readMinutes)} دقیقه مطالعه
          </span>
        </span>
      </Link>
    );
  }

  return (
    <article className={cn("surface-card lift group overflow-hidden", variant === "wide" && "md:grid md:grid-cols-[1.1fr_1fr]")}>
      <Link href={`/articles/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={article.cover}
          alt={article.title}
          fill
          sizes={variant === "wide" ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 1024px) 32vw, 100vw"}
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950/45 to-transparent opacity-70" />
        <span className="absolute bottom-3 start-3">
          <Badge tone="brand" size="sm" className="bg-white/90 text-brand-800 ring-white/40 backdrop-blur dark:bg-ink-950/70 dark:text-brand-200">
            {article.category}
          </Badge>
        </span>
      </Link>

      <div className="flex flex-col p-5">
        <div className="flex items-center gap-3 text-[0.66rem] font-bold text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />
            {fa(article.readMinutes)} دقیقه
          </span>
          <span className="flex items-center gap-1">
            <Icon name="calendar" size={12} />
            {formatDate(article.publishedAt, "medium")}
          </span>
        </div>

        <h3 className="mt-3 flex-1 text-[0.98rem] font-black leading-7 text-ink-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.8rem] leading-7 text-ink-600 dark:text-ink-300">{article.excerpt}</p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-4">
          <span className="truncate text-[0.68rem] font-bold text-ink-500 dark:text-ink-400">{article.author}</span>
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex shrink-0 items-center gap-1 text-[0.72rem] font-black text-brand-700 hover:gap-2 dark:text-brand-300"
          >
            مطالعه
            <Icon name="arrowLeft" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
