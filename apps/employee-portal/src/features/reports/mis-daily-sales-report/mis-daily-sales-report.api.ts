import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DailySalesFilter,
  DailySalesResult,
  DispositionRow,
} from "./mis-daily-sales-report.types";

const SALES_URL = "/alpha/v1/report/daily-sales";
const DISPOSITION_URL = "/alpha/v1/report/sales-disposition";

/**
 * Legacy `getSalesReport()` adds 1 day to end_date before sending — keep that
 * behavior (the server treats end_date as exclusive).
 */
function plusOneDay(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function useDailySalesReport(filter: DailySalesFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  const endDate = plusOneDay(filter.endDate);
  if (endDate) qs.push(`end_date=${encodeURIComponent(endDate)}`);
  const url = qs.length > 0 ? `${SALES_URL}?${qs.join("&")}` : SALES_URL;

  return useQuery({
    queryKey: ["mis-daily-sales-report", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<DailySalesResult> => {
      const body = await api.get<unknown, any>(url);
      const data = body?.data ?? body ?? {};
      return {
        sales: Array.isArray(data?.sales) ? data.sales : [],
        dashboard:
          data?.dashboard && typeof data.dashboard === "object"
            ? data.dashboard
            : {},
      };
    },
  });
}

export function useSalesDisposition(filter: DailySalesFilter) {
  const qs: string[] = [`scope=APPLICATION_FLOW`];
  if (filter.startDate) qs.push(`startDate=${encodeURIComponent(filter.startDate)}`);
  const endDate = plusOneDay(filter.endDate);
  if (endDate) qs.push(`end_date=${encodeURIComponent(endDate)}`);
  const url = `${DISPOSITION_URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: ["mis-daily-sales-disposition", filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<DispositionRow[]> => {
      const body = await api.get<unknown, any>(url);
      const data = body?.data ?? body ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
}
