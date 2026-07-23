import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LookupItem } from "../lookup-master-list/lookup-master-list.types";

// Legacy craft-frontend/src/pages/Configuration/LookupMaster/{LookupList.js,AddLookup.js}
// GET  /alpha/v1/lookup?id=X -> { status, data: LookupMaster[] }
// The save itself now goes through the workflow-runtime's saveStepData (see
// LOOKUP_MASTER_CREATION in workflow-runtime.api.ts) rather than a bespoke
// useSaveLookup mutation.
const URL = "/alpha/v1/lookup";

export function useLookupDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["lookup-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<LookupItem | null> => {
      const body = await api.get<unknown, any>(
        `${URL}?id=${encodeURIComponent(id!)}`,
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as LookupItem) : null;
      return first ?? null;
    },
  });
}
