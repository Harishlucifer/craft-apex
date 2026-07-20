import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderDetail,
  LoanTypeMasterOption,
  LookupItem,
} from "./lender-form.types";

const LENDER_URL = "/alpha/v1/master/lender";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=GST_TYPE,LENDER_TYPE,LENDER_APPLY_METHOD,LENDER_STATUS_FETCH_METHOD,CONTRACT_TYPE,LINK_TYPE";

export function useLenderLookups() {
  return useQuery({
    queryKey: [
      "lookup",
      "GST_TYPE,LENDER_TYPE,LENDER_APPLY_METHOD,LENDER_STATUS_FETCH_METHOD,CONTRACT_TYPE,LINK_TYPE",
    ],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useLenderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["lender-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<LenderDetail | null> => {
      const body = await api.get<unknown, any>(
        `${LENDER_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as LenderDetail | null;
    },
  });
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-master-options"],
    queryFn: async (): Promise<LoanTypeMasterOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeMasterOption[]) : [];
    },
  });
}
