import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TargetPlanRow } from "./target-plan-list.types";

// Legacy: GetCall(APIENDPOINTS.CREATE_UPDATE_TARGET_PLAN) -> response.data.data
const URL = "/alpha/v1/master/target-plan";

export function useTargetPlanList() {
  return useQuery({
    queryKey: ["target-plan-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<TargetPlanRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TargetPlanRow[]) : [];
    },
  });
}
