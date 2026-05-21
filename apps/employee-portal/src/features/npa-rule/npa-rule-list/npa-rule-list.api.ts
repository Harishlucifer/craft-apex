import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NpaRuleRow } from "./npa-rule-list.types";

// Legacy: GetCall(APIENDPOINTS.RULE_CATEGORY_LIST + "?category_type=NPA_RULE")
const URL = "/alpha/v1/rule/categories?category_type=NPA_RULE";

export function useNpaRuleList() {
  return useQuery({
    queryKey: ["npa-rule-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<NpaRuleRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as NpaRuleRow[]) : [];
    },
  });
}
