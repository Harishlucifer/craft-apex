import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  SourceProductivityFilter,
  SourceProductivityResult,
} from "./mis-source-productivity.types";

const URL = "/alpha/v1/report/source-productivity";

export function useSourceProductivity(filter: SourceProductivityFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: [
      "mis-source-productivity",
      filter.startDate ?? "",
      filter.endDate ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SourceProductivityResult> => {
      const body = await api.post<unknown, any>(url, {});
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        dashboard: Array.isArray(result?.dashboard) ? result.dashboard : [],
        sourced_productivity_data: Array.isArray(result?.sourced_productivity_data)
          ? result.sourced_productivity_data
          : [],
      };
    },
  });
}
