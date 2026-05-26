import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiDataResponse,
  DispositionRow,
  EmployeeOption,
  LeadDispositionFilter,
  SalesDashboard,
  TerritoryOption,
} from "./lead-disposition.types";

// Legacy ApiEndPoint.js:
//   ROLE_GET            = /alpha/v1/employee  (with optional ?territory_id=)
//   LEAST_TERRITORY     = /alpha/v1/user/least/territory
//   SALES_REPORT        = /alpha/v1/report/daily-sales
//   DISPOSITION_STREAM  = /alpha/v1/report/sales-disposition
const ROLE_GET_URL = "/alpha/v1/employee";
const LEAST_TERRITORY_URL = "/alpha/v1/user/least/territory";
const SALES_REPORT_URL = "/alpha/v1/report/daily-sales";
const DISPOSITION_STREAM_URL = "/alpha/v1/report/sales-disposition";

export function useTerritoryOptions() {
  return useQuery({
    queryKey: ["user-least-territory"],
    queryFn: async (): Promise<TerritoryOption[]> => {
      const body = await api.get<unknown, ApiDataResponse<TerritoryOption[]>>(
        LEAST_TERRITORY_URL
      );
      return body?.data ?? [];
    },
  });
}

export function useEmployeesByTerritory(territoryId: string | null) {
  return useQuery({
    queryKey: ["lead-disp-employees", territoryId ?? ""],
    enabled: true,
    queryFn: async (): Promise<EmployeeOption[]> => {
      const url = territoryId
        ? `${ROLE_GET_URL}?territory_id=${encodeURIComponent(territoryId)}`
        : ROLE_GET_URL;
      const body = await api.get<unknown, ApiDataResponse<EmployeeOption[]>>(url);
      return body?.data ?? [];
    },
  });
}

// SALES_REPORT — legacy uses snake_case `start_date`/`end_date` with
// `territoryId`/`userId` (mixed). Verbatim port.
export interface SalesResult {
  sales: unknown[];
  dashboard: SalesDashboard;
}

export function useSalesReport(filter: LeadDispositionFilter) {
  const qs: string[] = [];
  if (filter.territoryId) qs.push(`territoryId=${encodeURIComponent(filter.territoryId)}`);
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  if (filter.userId) qs.push(`userId=${encodeURIComponent(filter.userId)}`);
  const url = qs.length > 0 ? `${SALES_REPORT_URL}?${qs.join("&")}` : SALES_REPORT_URL;

  return useQuery({
    queryKey: [
      "lead-disp-sales",
      filter.startDate ?? "",
      filter.endDate ?? "",
      filter.territoryId ?? "",
      filter.userId ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SalesResult> => {
      const body = await api.get<unknown, ApiDataResponse<{ sales?: unknown[]; dashboard?: SalesDashboard }>>(
        url
      );
      const data = body?.data ?? null;
      return {
        sales: Array.isArray(data?.sales) ? data!.sales! : [],
        dashboard:
          data?.dashboard && typeof data.dashboard === "object"
            ? data.dashboard
            : {},
      };
    },
  });
}

// DISPOSITION_STREAM — legacy uses camelCase `startDate`/`endDate` here
// (different from SALES_REPORT — verbatim port). Always sends
// `scope=APPLICATION_FLOW`.
export function useSalesDisposition(filter: LeadDispositionFilter) {
  const qs: string[] = ["scope=APPLICATION_FLOW"];
  if (filter.territoryId) qs.push(`territoryId=${encodeURIComponent(filter.territoryId)}`);
  if (filter.startDate) qs.push(`startDate=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`endDate=${encodeURIComponent(filter.endDate)}`);
  if (filter.userId) qs.push(`userId=${encodeURIComponent(filter.userId)}`);
  const url = `${DISPOSITION_STREAM_URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: [
      "lead-disp-stream",
      filter.startDate ?? "",
      filter.endDate ?? "",
      filter.territoryId ?? "",
      filter.userId ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<DispositionRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<DispositionRow[]>>(url);
      return body?.data ?? [];
    },
  });
}
