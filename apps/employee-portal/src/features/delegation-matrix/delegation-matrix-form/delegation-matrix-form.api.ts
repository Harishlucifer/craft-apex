import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UnderwritingMatrixRow } from "../delegation-matrix-list/delegation-matrix-list.types";
import type { UnderwritingMatrixSavePayload } from "./delegation-matrix-form.types";
import type { RuleDetail, RuleSavePayload, ParameterRow } from "../../rule/rule-form/rule-form.types";

const UNDERWRITING_MATRIX_URL = "/alpha/v1/master/underwriting-matrix";
const LOOKUP_MASTER_URL = "/alpha/v1/lookup";
const RULE_URL = "/alpha/v1/rule";
const RULE_CREATE_URL = "/alpha/v1/rule/create";
const PARAMETERS_URL = "/alpha/v1/parameter";

export interface LookupRow {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export function useUnderwritingMatrixDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["underwriting-matrix-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<UnderwritingMatrixRow | null> => {
      const body = await api.get<unknown, any>(
        `${UNDERWRITING_MATRIX_URL}?underwritingMatrixId=${encodeURIComponent(id!)}`
      );
      console.log("matrix detail raw body:", body);
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as UnderwritingMatrixRow) : null;
      console.log("matrix detail first row:", first);
      return first ?? null;
    },
  });
}

export function useSaveUnderwritingMatrix() {
  return useMutation({
    mutationFn: async (payload: UnderwritingMatrixSavePayload) => {
      return api.post<unknown, any>(UNDERWRITING_MATRIX_URL, payload);
    },
  });
}

export function useDelegationFormLookups() {
  return useQuery({
    queryKey: ["delegation-form-lookups"],
    queryFn: async (): Promise<LookupRow[]> => {
      const body = await api.get<unknown, any>(
        `${LOOKUP_MASTER_URL}?group_code=WORKFLOW_TYPE,HIERARCHY`
      );
      const arr = body?.data?.data ?? body?.data ?? [];
      return Array.isArray(arr) ? (arr as LookupRow[]) : [];
    },
  });
}

export function useRuleDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["delegation-rule-detail", id ?? ""],
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
    mutationFn: async (payload: RuleSavePayload): Promise<{ data?: { data?: { rule_id: string } }; rule_id?: string }> => {
      return api.post<unknown, any>(RULE_CREATE_URL, payload);
    },
  });
}

export function useParameterList() {
  return useQuery({
    queryKey: ["parameter-list-for-delegation"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}
