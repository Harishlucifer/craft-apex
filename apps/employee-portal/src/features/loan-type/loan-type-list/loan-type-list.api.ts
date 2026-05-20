import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoanTypeRow } from "./loan-type-list.types";

// Legacy: GetCall(APIENDPOINTS.LOAN_TYPE_MASTER) -> response.data.data
const URL = "/alpha/v1/master/loan-type";

export function useLoanTypeList() {
  return useQuery({
    queryKey: ["loan-type-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}
