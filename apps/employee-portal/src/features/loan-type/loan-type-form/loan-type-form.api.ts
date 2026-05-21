import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LoanTypeDetail,
  LoanTypeSavePayload,
  LookupItem,
} from "./loan-type-form.types";

const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=LOAN_CATEGORY,APPLY_CAPACITY,EMPLOYMENT_TYPE,FACILITY_TYPE";

export function useLoanTypeLookups() {
  return useQuery({
    queryKey: ["lookup", "LOAN_CATEGORY,APPLY_CAPACITY,EMPLOYMENT_TYPE,FACILITY_TYPE"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useLoanTypeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["loan-type-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<LoanTypeDetail | null> => {
      const body = await api.get<unknown, any>(
        `${LOAN_TYPE_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as LoanTypeDetail | null;
    },
  });
}

export function useSaveLoanType() {
  return useMutation({
    mutationFn: async (payload: LoanTypeSavePayload) =>
      api.post<unknown, any>(LOAN_TYPE_URL, payload),
  });
}
