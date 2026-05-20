import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LenderRow } from "./lender-list.types";

// Legacy: axios.get /alpha/v1/master/lender -> response.result
const URL = "/alpha/v1/master/lender";

export function useLenderList() {
  return useQuery({
    queryKey: ["lender-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}
