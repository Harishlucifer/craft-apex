import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ProcessStatusFilter,
  ProcessStatusResult,
} from "./mis-process-status.types";

const URL = "/alpha/v1/report/process-report";

export function useProcessStatus(filter: ProcessStatusFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: ["mis-process-status", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ProcessStatusResult> => {
      const body = await api.post<unknown, any>(url, {});
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        process_report_list: Array.isArray(result?.process_report_list)
          ? result.process_report_list
          : [],
        summary: Array.isArray(result?.summary) ? result.summary : [],
      };
    },
  });
}
