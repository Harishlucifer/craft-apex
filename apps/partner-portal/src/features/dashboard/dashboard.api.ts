// Legacy: channel-flexi/src/Components/Common/Dashboard/index.js (fetchData)
//   APIENDPOINTS.GET_DASHBOARD_SUMMARY + `?from_date=${fromDate}&to_date=${toDate}`
//   (+ `&exclude_journey_type=${module.configuration.exclude_journey_types}`)
// = GET /alpha/v1/dashboard/summary   (alpha-api app/routes/v1.go:180 → losController.ProductDashboard)
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardSummaryData,
  DashboardSummaryResponse,
  SummaryWidget,
} from "./dashboard.types";

const URL_DASHBOARD_SUMMARY = "/alpha/v1/dashboard/summary";

function buildUrl(fromDate: string, toDate: string, exclude?: string): string {
  let url = `${URL_DASHBOARD_SUMMARY}?from_date=${encodeURIComponent(
    fromDate
  )}&to_date=${encodeURIComponent(toDate)}`;
  if (exclude) url += `&exclude_journey_type=${encodeURIComponent(exclude)}`;
  return url;
}

export function useDashboardSummary(params: {
  fromDate: string;
  toDate: string;
  exclude?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: [
      "partner-dashboard.summary",
      params.fromDate,
      params.toDate,
      params.exclude ?? "",
    ],
    enabled: params.enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<DashboardSummaryData> => {
      const body = await api.get<unknown, DashboardSummaryResponse>(
        buildUrl(params.fromDate, params.toDate, params.exclude)
      );
      // Legacy: setLeadSummary(result.lead ?? result); setLenderWiseSummary(result.lender)
      const root = body?.result !== undefined ? body : (body?.data ?? body);
      const result = root?.result;
      if (Array.isArray(result)) {
        // Older payloads return the lead widgets as the bare `result` array.
        return { lead: result, lender: [] };
      }
      const lead = result?.lead;
      const lender = result?.lender;
      return {
        lead: Array.isArray(lead) ? (lead as SummaryWidget[]) : [],
        lender: Array.isArray(lender) ? (lender as SummaryWidget[]) : [],
      };
    },
  });
}
