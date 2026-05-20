import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LenderSchemeRow } from "./lender-scheme-list.types";

// Legacy: GetCall(APIENDPOINTS.LENDER_SCHEME_LIST) -> response.data.data
const URL = "/alpha/v1/master/lender/schemes";

export function useLenderSchemeList() {
  return useQuery({
    queryKey: ["lender-scheme-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LenderSchemeRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LenderSchemeRow[]) : [];
    },
  });
}
