import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LookupGroup, LookupItem } from "./lookup-master-list.types";

// Legacy: GetCall(APIENDPOINTS.GET_LOOKUP_LIST); response.data.data is a
// { GROUP_CODE: LookupItem[] } map. Flatten to LookupGroup[] for the UI.
const URL = "/alpha/v1/lookup/group";

export function useLookupGroups() {
  return useQuery({
    queryKey: ["lookup-groups"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LookupGroup[]> => {
      const body = await api.get<unknown, any>(URL);
      const map: Record<string, LookupItem[]> | null =
        body?.data ?? body?.result ?? body ?? null;
      if (!map || typeof map !== "object" || Array.isArray(map)) return [];
      return Object.keys(map)
        .sort()
        .map((groupCode) => ({
          groupCode,
          values: Array.isArray(map[groupCode]) ? map[groupCode] : [],
        }));
    },
  });
}
