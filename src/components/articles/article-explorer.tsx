"use client";

import { useMemo, useState } from "react";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { SearchInput, SegmentedControl } from "@/components/ui/form";
import { ArticleCard } from "@/components/articles/article-card";
import { fa, normalizeFa } from "@/lib/format";
import type { ArticleView } from "@/lib/content";

export function ArticleExplorer({ articles }: { articles: ArticleView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState<"newest" | "longest">("newest");

  const categories = useMemo(
    () => ["همه", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  );

  const filtered = useMemo(() => {
    const q = normalizeFa(query);
    const list = articles.filter((article) => {
      const categoryOk = category === "همه" || article.category === category;
      if (!categoryOk) return false;
      if (!q) return true;
      return normalizeFa(`${article.title} ${article.excerpt} ${article.tags.join(" ")} ${article.category}`).includes(q);
    });
    return list.sort((a, b) =>
      sort === "newest" ? b.publishedAt.localeCompare(a.publishedAt) : b.readMinutes - a.readMinutes,
    );
  }, [articles, category, query, sort]);

  return (
    <div className="space-y-7">
      <div className="surface-card flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="جست‌وجو در مقالات… (مثلاً: تمدید کارت بهداشت)" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            value={sort}
            onChange={(value) => setSort(value as "newest" | "longest")}
            options={[
              { value: "newest", label: "جدیدترین", icon: "calendar" },
              { value: "longest", label: "مفصل‌ترین", icon: "book" },
            ]}
          />
          <span className="text-[0.72rem] font-bold text-ink-500 dark:text-ink-400">
            {fa(filtered.length)} مقاله
          </span>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((cat) => (
          <Chip
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
            count={cat === "همه" ? articles.length : articles.filter((a) => a.category === cat).length}
          >
            {cat}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="book"
          title="مقاله‌ای با این مشخصات پیدا نشد"
          description="عبارت دیگری را امتحان کنید یا دسته‌بندی «همه» را انتخاب کنید. برای پرسش‌های موردی نیز می‌توانید از فرم «سایر درخواست‌ها» استفاده کنید."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <div key={article.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
