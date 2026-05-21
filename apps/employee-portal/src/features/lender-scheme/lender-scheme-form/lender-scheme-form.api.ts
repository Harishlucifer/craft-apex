import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderRow,
  LenderSchemeDetail,
  LenderSchemeSavePayload,
  LoanTypeRow,
  LookupItem,
} from "./lender-scheme-form.types";

const SCHEME_URL = "/alpha/v1/master/lender/scheme";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";
const LOOKUP_URL = "/alpha/v1/lookup?group_code=CONTRACT_TYPE";

export function useSchemeLookups() {
  return useQuery({
    queryKey: ["lookup", "scheme-bundle"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useSchemeLoanTypes() {
  return useQuery({
    queryKey: ["loan-type-master-scheme"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

export function useSchemeLenders() {
  return useQuery({
    queryKey: ["lender-master-scheme"],
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}

export function useSchemeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["lender-scheme-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<LenderSchemeDetail | null> => {
      const body = await api.get<unknown, any>(
        `${SCHEME_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as LenderSchemeDetail | null;
    },
  });
}

export function useSaveScheme() {
  return useMutation({
    mutationFn: async (payload: LenderSchemeSavePayload) =>
      api.post<unknown, any>(SCHEME_URL, payload),
  });
}
