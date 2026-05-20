import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BeatPlanListResponse } from "./beat-plan-list.types";

// Legacy: GetCall(APIENDPOINTS.BEAT_PLAN_LIST + "?page=" + N + filters)
function buildUrl(page: number, actualViewToDate?: string): string {
  let url = `/alpha/v1/core/beat-list?page=${page}`;
  if (actualViewToDate) url += `&to_date=${actualViewToDate}`;
  return url;
}

export function useBeatPlanList(params: {
  page: number;
  actualViewToDate?: string;
}) {
  return useQuery({
    queryKey: ["beat-plan-list", params.page, params.actualViewToDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<BeatPlanListResponse> =>
      api.get<unknown, BeatPlanListResponse>(
        buildUrl(params.page, params.actualViewToDate)
      ),
  });
}
