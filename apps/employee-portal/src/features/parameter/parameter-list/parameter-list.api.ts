import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ParameterRow } from "./parameter-list.types";

// Legacy: const response = await GetCall(APIENDPOINTS.PARAMETERS); response.data.data
const URL = "/alpha/v1/parameter";

export function useParameterList() {
  return useQuery({
    queryKey: ["parameter-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}
