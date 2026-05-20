import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ScoreCardRow } from "./scoring-engine-list.types";

// Legacy: GetCall(APIENDPOINTS.GET_SCORECARD_LIST) -> response.data.data
const URL = "/alpha/v1/core/scorecard/list";

export function useScoreCardList() {
  return useQuery({
    queryKey: ["scoring-engine-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ScoreCardRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ScoreCardRow[]) : [];
    },
  });
}
