import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BankPerformanceFilter,
  BankPerformanceResult,
} from "./mis-bank-performance.types";

const URL = "/alpha/v1/report/bank-performance";

export function useBankPerformance(filter: BankPerformanceFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: ["mis-bank-performance", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<BankPerformanceResult> => {
      const body = await api.post<unknown, any>(url, {});
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        dashboard: Array.isArray(result?.dashboard) ? result.dashboard : [],
        bank_performance_list: Array.isArray(result?.bank_performance_list)
          ? result.bank_performance_list
          : [],
      };
    },
  });
}
