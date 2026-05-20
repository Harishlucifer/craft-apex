import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TerritoryRow } from "./territory-list.types";

// Legacy: axios.get /alpha/v1/master/territory -> response.data
const URL = "/alpha/v1/master/territory";

export function useTerritoryList() {
  return useQuery({
    queryKey: ["territory-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}
