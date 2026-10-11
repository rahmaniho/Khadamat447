"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/ui/form";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="مثلاً: مدارک کارت بهداشت، تمدید صلاحیت، پیگیری درخواست"
          autoFocus={!initialQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(e as unknown as React.FormEvent);
          }}
        />
      </div>
      <Button type="submit" icon="search" disabled={query.trim().length < 2}>
        جست‌وجو
      </Button>
    </form>
  );
}
