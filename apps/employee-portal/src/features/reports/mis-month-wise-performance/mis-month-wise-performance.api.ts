import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MonthWiseFilter,
  MonthWiseResult,
} from "./mis-month-wise-performance.types";

const URL = "/alpha/v1/report/month-performance";

export function useMonthWisePerformance(filter: MonthWiseFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: ["mis-month-wise-performance", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<MonthWiseResult> => {
      const body = await api.post<unknown, any>(url, {});
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        dashboard: Array.isArray(result?.dashboard) ? result.dashboard : [],
        month_performance_data: Array.isArray(result?.month_performance_data)
          ? result.month_performance_data
          : [],
      };
    },
  });
}
