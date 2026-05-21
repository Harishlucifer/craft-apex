import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PendencyReportFilter,
  PendencyReportResult,
} from "./mis-pendency-report.types";

// Legacy POST /alpha/v1/report/pendency-report?{filters} with empty body.
// FetchAndFormik.js builds the query string from a Formik values object;
// we forward only the date range here. Other filters (territory, employees,
// channels, lenders, loan types, journey type) need lookups not yet ported.
const URL = "/alpha/v1/report/pendency-report";

export function usePendencyReport(filter: PendencyReportFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: ["mis-pendency-report", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PendencyReportResult> => {
      const body = await api.post<unknown, any>(url, {});
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        dashboard: Array.isArray(result?.dashboard) ? result.dashboard : [],
        pendency_report_data: Array.isArray(result?.pendency_report_data)
          ? result.pendency_report_data
          : [],
      };
    },
  });
}
