import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RuleRow } from "./rule-list.types";

// Legacy: GetCall(APIENDPOINTS.RULE_DATA) -> response.data.data
const URL = "/alpha/v1/rule";

export function useRuleList() {
  return useQuery({
    queryKey: ["rule-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<RuleRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as RuleRow[]) : [];
    },
  });
}
