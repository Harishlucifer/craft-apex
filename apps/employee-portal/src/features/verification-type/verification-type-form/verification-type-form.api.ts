import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderRow,
  LoanTypeRow,
  LookupItem,
  RuleRow,
  VerificationCategoryDetail,
  VerificationCategorySavePayload,
} from "./verification-type-form.types";

const VC_URL = "/alpha/v1/verification/category";
const VC_CREATE_URL = "/alpha/v1/verification/category/create";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=EMPLOYMENT_TYPE,APPLY_CAPACITY,VERIFICATION_TYPE,VERIFICATION_RELATIONSHIP_TYPE,QUESTIONNAIRE_FIELD_TYPE,CHECKLIST_TYPE";
const RULE_URL = "/alpha/v1/rule";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";

export function useVcLookups() {
  return useQuery({
    queryKey: ["lookup", "verification-category-bundle"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useVcLoanTypes() {
  return useQuery({
    queryKey: ["loan-type-master-options-vc"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

export function useVcLenders() {
  return useQuery({
    queryKey: ["lender-master-options-vc"],
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}

export function useVcRules() {
  return useQuery({
    queryKey: ["rule-list-for-vc"],
    queryFn: async (): Promise<RuleRow[]> => {
      const body = await api.get<unknown, any>(RULE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as RuleRow[]) : [];
    },
  });
}

export function useVcDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["verification-category-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<VerificationCategoryDetail | null> => {
      const body = await api.get<unknown, any>(
        `${VC_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as VerificationCategoryDetail | null;
    },
  });
}

export function useSaveVerificationCategory() {
  return useMutation({
    mutationFn: async (payload: VerificationCategorySavePayload) =>
      api.post<unknown, any>(VC_CREATE_URL, payload),
  });
}
