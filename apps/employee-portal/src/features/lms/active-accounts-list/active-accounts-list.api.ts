import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActiveAccountRow } from "./active-accounts-list.types";

// Legacy: GetCall(APIENDPOINTS.LMS_LIST) -> response.data.data
const URL = "/alpha/v1/loan-account/list";

export function useActiveAccountsList() {
  return useQuery({
    queryKey: ["lms-active-accounts"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ActiveAccountRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ActiveAccountRow[]) : [];
    },
  });
}
