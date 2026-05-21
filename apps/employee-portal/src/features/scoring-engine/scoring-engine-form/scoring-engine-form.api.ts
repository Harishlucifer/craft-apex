import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ScorecardDetail,
  ScorecardSavePayload,
} from "./scoring-engine-form.types";

const SCORECARD_URL = "/alpha/v1/core/scorecard";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const PARAMETERS_URL = "/alpha/v1/parameter";
const RULE_URL = "/alpha/v1/rule";
const RULE_CREATE_URL = "/alpha/v1/rule/create";

export interface LoanTypeOption {
  id: string | number;
  name: string;
}

export interface ParameterRow {
  id: string | number;
  code: string;
  name: string;
  type?: string;
  param_field?: string;
  reference_table?: string;
  reference_column?: string;
  reference_label?: string;
  reference_condition?: string;
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-master-options-scoring"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

export function useScoringParameterList() {
  return useQuery({
    queryKey: ["parameter-list-for-scoring"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}

export function useScorecardDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["scorecard-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<ScorecardDetail | null> => {
      const body = await api.get<unknown, any>(
        `${SCORECARD_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as ScorecardDetail | null;
    },
  });
}

export function useSaveScorecard() {
  return useMutation({
    mutationFn: async (payload: ScorecardSavePayload) =>
      api.post<unknown, any>(SCORECARD_URL, payload),
  });
}

export async function fetchRuleById(ruleId: string | number) {
  const body = await api.get<unknown, any>(
    `${RULE_URL}/?id=${encodeURIComponent(String(ruleId))}`
  );
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? arr[0] : null;
}

export interface ScoringRuleSavePayload {
  rule_id?: string | number;
  rule_name: string;
  rule_type: "";
  status: number;
  rule: unknown;
  validation_params: null;
  output_params: null;
}

export async function saveScoringRule(payload: ScoringRuleSavePayload) {
  return api.post<unknown, any>(RULE_CREATE_URL, payload);
}
