import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { JourneyTypeRow } from "./journey-master-list.types";

// Legacy: GetCall(APIENDPOINTS.JOURNEY_TYPE) -> response.data.data
const URL = "/alpha/v1/master/journey-type";

export function useJourneyTypeList() {
  return useQuery({
    queryKey: ["journey-type-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<JourneyTypeRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as JourneyTypeRow[]) : [];
    },
  });
}
