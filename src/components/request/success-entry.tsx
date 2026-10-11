"use client";

import { useSearchParams } from "next/navigation";
import { RequestSuccess } from "@/components/request/success-view";

export function SuccessEntry() {
  const params = useSearchParams();
  return <RequestSuccess code={params.get("code") ?? ""} />;
}
