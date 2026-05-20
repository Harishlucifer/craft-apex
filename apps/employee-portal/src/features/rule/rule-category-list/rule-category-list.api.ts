import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RuleCategoryRow } from "./rule-category-list.types";

// Legacy: GetCall(APIENDPOINTS.RULE_CATEGORY_LIST) -> response.data.data
const URL = "/alpha/v1/rule/categories";

export function useRuleCategoryList() {
  return useQuery({
    queryKey: ["rule-category-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<RuleCategoryRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as RuleCategoryRow[]) : [];
    },
  });
}
