import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderSchemeRow,
  LoanTypeRow,
  NpaRuleCategoryDetail,
  NpaRuleCategorySavePayload,
  ParameterRow,
  RuleSaveForNpaPayload,
} from "./npa-rule-form.types";

const RULE_URL = "/alpha/v1/rule";
const RULE_CREATE_URL = "/alpha/v1/rule/create";
const RULE_CATEGORY_CREATE_URL = "/alpha/v1/rule/category";
const RULE_CATEGORY_LIST_URL = "/alpha/v1/rule/categories";
const LENDER_SCHEME_URL = "/alpha/v1/master/lender/scheme";
const LENDER_SCHEME_LIST_URL = "/alpha/v1/master/lender/schemes";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const PARAMETERS_URL = "/alpha/v1/parameter";

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-master-options"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

export function useLenderSchemeOptions() {
  return useQuery({
    queryKey: ["lender-scheme-options"],
    queryFn: async (): Promise<LenderSchemeRow[]> => {
      const body = await api.get<unknown, any>(LENDER_SCHEME_LIST_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LenderSchemeRow[]) : [];
    },
  });
}

export function useNpaRuleParameterList() {
  return useQuery({
    queryKey: ["parameter-list-for-npa"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}

export function useNpaRuleCategoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["npa-rule-category-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<NpaRuleCategoryDetail | null> => {
      const body = await api.get<unknown, any>(
        `${RULE_CATEGORY_LIST_URL}?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as NpaRuleCategoryDetail) : null;
      return first ?? null;
    },
  });
}

export async function fetchRuleById(ruleId: string | number) {
  const body = await api.get<unknown, any>(
    `${RULE_URL}/?id=${encodeURIComponent(String(ruleId))}`
  );
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? arr[0] : null;
}

export async function fetchLinkedScheme(
  ruleCategoryId: string | number,
  ruleType: string
): Promise<string> {
  const queryParam =
    ruleType === "NPA_MARKING"
      ? `npa_marking_rule_id=${encodeURIComponent(String(ruleCategoryId))}`
      : `npa_provisioning_rule_id=${encodeURIComponent(String(ruleCategoryId))}`;
  const body = await api.get<unknown, any>(
    `${LENDER_SCHEME_LIST_URL}?${queryParam}`
  );
  const arr = body?.data ?? body?.result ?? body;
  if (Array.isArray(arr) && arr.length > 0) {
    return String(arr[0].lender_scheme_id ?? "");
  }
  return "";
}

export async function fetchLenderSchemeById(id: string | number) {
  const body = await api.get<unknown, any>(
    `${LENDER_SCHEME_URL}/${encodeURIComponent(String(id))}`
  );
  // Legacy reads both `.data.data` and `.data.result` depending on the endpoint.
  return body?.data ?? body?.result ?? body;
}

export async function updateLenderScheme(payload: any) {
  return api.post<unknown, any>(LENDER_SCHEME_URL, payload);
}

export function useSaveRuleForNpa() {
  return useMutation({
    mutationFn: async (payload: RuleSaveForNpaPayload) =>
      api.post<unknown, any>(RULE_CREATE_URL, payload),
  });
}

export function useSaveNpaRuleCategory() {
  return useMutation({
    mutationFn: async (payload: NpaRuleCategorySavePayload) =>
      api.post<unknown, any>(RULE_CATEGORY_CREATE_URL, payload),
  });
}
