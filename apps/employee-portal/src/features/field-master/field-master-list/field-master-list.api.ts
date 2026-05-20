import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FieldMasterRow } from "./field-master-list.types";

// Legacy: GetCall(`/alpha/v1/master/field-master?type=${listType}`) -> response.data.data
function buildUrl(type: string): string {
  return `/alpha/v1/master/field-master?type=${encodeURIComponent(type)}`;
}

export function useFieldMasterList(type: string) {
  return useQuery({
    queryKey: ["field-master-list", type],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<FieldMasterRow[]> => {
      const body = await api.get<unknown, any>(buildUrl(type));
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as FieldMasterRow[]) : [];
    },
  });
}
