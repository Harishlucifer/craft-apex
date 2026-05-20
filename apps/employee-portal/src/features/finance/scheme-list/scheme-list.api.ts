import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SchemeListResponse, SchemeRow } from "./scheme-list.types";

// Legacy: GetCall(APIENDPOINTS.SCHEME + `?category=${category}`); body.data is the array
function buildUrl(category?: string): string {
  return category
    ? `/alpha/v1/finance/scheme?category=${encodeURIComponent(category)}`
    : "/alpha/v1/finance/scheme";
}

export function useSchemeList(category: string | undefined) {
  return useQuery({
    queryKey: ["finance-scheme-list", category ?? ""],
    enabled: Boolean(category),
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SchemeRow[]> => {
      const body = await api.get<unknown, SchemeListResponse>(buildUrl(category));
      const arr = body?.data ?? (body as unknown as SchemeRow[]);
      return Array.isArray(arr) ? (arr as SchemeRow[]) : [];
    },
  });
}
