import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BuilderRow } from "./builder-list.types";

// Legacy: GetCall(APIENDPOINTS.DEVELOPER) -> response.data.data
const URL = "/alpha/v1/master/developer";

export function useBuilderList() {
  return useQuery({
    queryKey: ["builder-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<BuilderRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as BuilderRow[]) : [];
    },
  });
}
