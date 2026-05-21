import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  toDdMmYyyy,
  type ConveyanceFilter,
  type ConveyanceResult,
} from "./mis-conveyance-report.types";

const URL = "/alpha/v1/report/verification-conveyance";

export function useConveyanceReport(filter: ConveyanceFilter) {
  const startDate = toDdMmYyyy(filter.startDate);
  const endDate = toDdMmYyyy(filter.endDate);
  const qs: string[] = [];
  if (startDate) qs.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) qs.push(`endDate=${encodeURIComponent(endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: [
      "mis-conveyance-report",
      filter.startDate ?? "",
      filter.endDate ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ConveyanceResult> => {
      const body = await api.get<unknown, any>(url);
      const data = body?.data ?? body ?? {};
      return {
        dashboard: Array.isArray(data?.dashboard) ? data.dashboard : [],
        report_data: Array.isArray(data?.report_data) ? data.report_data : [],
      };
    },
  });
}
