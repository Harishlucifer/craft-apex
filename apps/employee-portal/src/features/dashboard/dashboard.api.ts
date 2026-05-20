import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardData,
  DashboardResponse,
  SummaryWidget,
} from "./dashboard.types";

// Legacy: APIENDPOINTS.GET_DASHBOARD_SUMMARY + `?from_date=&to_date=`
// (+ exclude_journey_type). = /alpha/v1/dashboard/summary
function buildUrl(fromDate: string, toDate: string, exclude?: string): string {
  let url = `/alpha/v1/dashboard/summary?from_date=${fromDate}&to_date=${toDate}`;
  if (exclude) url += `&exclude_journey_type=${exclude}`;
  return url;
}

export function useDashboard(params: {
  fromDate: string;
  toDate: string;
  exclude?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["dashboard", params.fromDate, params.toDate, params.exclude],
    enabled: params.enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<DashboardData> => {
      const res = await api.get<unknown, DashboardResponse>(
        buildUrl(params.fromDate, params.toDate, params.exclude)
      );
      // Legacy: setLeadSummary(result.lead ?? result); setLenderWiseSummary(result.lender)
      const root = res?.result !== undefined ? res : (res?.data ?? res);
      const result = (root as DashboardResponse)?.result;
      if (Array.isArray(result)) {
        return { lead: result as SummaryWidget[], lender: [] };
      }
      return {
        lead: result?.lead ?? [],
        lender: result?.lender ?? [],
      };
    },
  });
}
