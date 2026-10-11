"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Accordion } from "@/components/ui/overlay";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { SearchInput } from "@/components/ui/form";
import { Markdown } from "@/components/site/markdown";
import { fa, normalizeFa } from "@/lib/format";
import type { FaqView } from "@/lib/content";

export function FaqList({
  items,
  searchable = true,
  withCategories = true,
  defaultCategory = "همه",
}: {
  items: FaqView[];
  searchable?: boolean;
  withCategories?: boolean;
  defaultCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(defaultCategory);

  const categories = useMemo(() => ["همه", ...Array.from(new Set(items.map((i) => i.category)))], [items]);

  const filtered = useMemo(() => {
    const q = normalizeFa(query);
    return items.filter((item) => {
      const categoryOk = category === "همه" || item.category === category;
      if (!categoryOk) return false;
      if (!q) return true;
      return normalizeFa(`${item.question} ${item.plainAnswer} ${item.category}`).includes(q);
    });
  }, [items, query, category]);

  return (
    <div className="space-y-6">
      {searchable && (
        <div className="flex flex-col gap-4">
          <SearchInput value={query} onChange={setQuery} placeholder="جست‌وجو در پرسش‌ها… (مثلاً: مدارک، پیگیری، زمان)" />
          {withCategories && (
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                  count={cat === "همه" ? items.length : items.filter((i) => i.category === cat).length}
                >
                  {cat}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {query && (
        <p className="flex items-center gap-2 text-[0.78rem] font-bold text-ink-500 dark:text-ink-400">
          <Icon name="search" size={15} />
          {fa(filtered.length)} پرسش یافت شد
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="chat"
          title="پرسشی با این عبارت یافت نشد"
          description="می‌توانید عبارت دیگری بنویسید یا پرسش خود را از طریق فرم «سایر درخواست‌ها» برای کارشناس دفتر ارسال کنید."
        />
      ) : (
        <Accordion
          items={filtered.map((item) => ({
            id: item.id,
            title: item.question,
            icon: "chat",
            meta: (
              <span className="inline-flex items-center gap-2">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[0.62rem] font-black text-brand-700 dark:bg-brand-500/12 dark:text-brand-200">
                  {item.category}
                </span>
              </span>
            ),
            content: (
              <div className="prose-fa text-[0.86rem]">
                <Markdown source={item.answer} />
              </div>
            ),
          }))}
        />
      )}
    </div>
  );
}
