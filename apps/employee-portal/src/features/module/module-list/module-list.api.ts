import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ModuleRow } from "./module-list.types";

// Legacy: GetCall(APIENDPOINTS.MASTER_MODULE) -> response.data.data
const URL = "/alpha/v1/master/module";

export function useModuleList() {
  return useQuery({
    queryKey: ["module-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ModuleRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ModuleRow[]) : [];
    },
  });
}
