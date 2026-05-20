import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChecklistRow } from "./doc-checklist-list.types";

// Legacy: axios.get /alpha/v1/master/checklist -> response.result
const URL = "/alpha/v1/master/checklist";

export function useChecklistList() {
  return useQuery({
    queryKey: ["doc-checklist-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ChecklistRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as ChecklistRow[]) : [];
    },
  });
}
