import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ParameterRow,
  RuleDetail,
  RuleSavePayload,
} from "./rule-form.types";

const RULE_URL = "/alpha/v1/rule";
const RULE_CREATE_URL = "/alpha/v1/rule/create";
const PARAMETERS_URL = "/alpha/v1/parameter";

export function useRuleParameterList() {
  return useQuery({
    queryKey: ["parameter-list-for-rule"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}

export function useRuleDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["rule-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<RuleDetail | null> => {
      const body = await api.get<unknown, any>(
        `${RULE_URL}/?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as RuleDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveRule() {
  return useMutation({
    mutationFn: async (payload: RuleSavePayload) =>
      api.post<unknown, any>(RULE_CREATE_URL, payload),
  });
}
