import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PlatformLookupItem,
  UsageReportFilter,
  UsageReportResult,
} from "./system-usage-report.types";

const REPORT_URL = "/alpha/v1/report/usage-report";
const LOOKUP_URL = "/alpha/v1/lookup?group_code=PLATFORM";
const REVERT_URL = "/alpha/v1/user/user-revert";

/**
 * Mirrors PlatformUsageReport.fetchData (index.js lines 81-100):
 *   if (startDate) ?start_date=…
 *   if (endDate)   &end_date=…
 *   if (platform)  &platform=…
 * Response shape: body.data.result.{dashboard, usage_data, platform_chart, line_chart}.
 */
export function useSystemUsageReport(filter: UsageReportFilter) {
  const qs: string[] = [];
  if (filter.startDate)
    qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate)
    qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  if (filter.platform)
    qs.push(`platform=${encodeURIComponent(filter.platform)}`);
  const url = qs.length > 0 ? `${REPORT_URL}?${qs.join("&")}` : REPORT_URL;

  return useQuery({
    queryKey: [
      "system-usage-report",
      filter.startDate ?? "",
      filter.endDate ?? "",
      filter.platform ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<UsageReportResult> => {
      const body = await api.get<unknown, any>(url);
      // Legacy reads response.data?.result.
      const result = body?.data?.result ?? body?.result ?? body ?? {};
      return {
        dashboard: Array.isArray(result?.dashboard) ? result.dashboard : [],
        usage_data: Array.isArray(result?.usage_data) ? result.usage_data : [],
        platform_chart: Array.isArray(result?.platform_chart)
          ? result.platform_chart
          : [],
        line_chart: Array.isArray(result?.line_chart) ? result.line_chart : [],
      };
    },
  });
}

/** PLATFORM lookup for the filter dropdown (legacy UsageFilter.js lines 18-34). */
export function usePlatformLookup() {
  return useQuery({
    queryKey: ["lookup", "PLATFORM"],
    queryFn: async (): Promise<PlatformLookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      // Legacy reads Platform.data?.data; new API may put rows at body.data
      // or body.result. Walk both shapes.
      const arr =
        body?.data?.data ?? body?.data ?? body?.result ?? body ?? [];
      return Array.isArray(arr) ? (arr as PlatformLookupItem[]) : [];
    },
  });
}

/**
 * Per-row "Revert Lock" action shown when user_account_frozen is truthy
 * (legacy PlatformUsageReport.handleRevert).
 *
 *   POST /alpha/v1/user/user-revert  { user_id, platform }
 */
export function useRevertUserAccount() {
  return useMutation({
    mutationFn: async (payload: { user_id: number | string; platform: string }) =>
      api.post<unknown, any>(REVERT_URL, payload),
  });
}
