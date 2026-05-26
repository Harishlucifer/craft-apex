import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiDataResponse,
  EmployeeOption,
  PartnerDispositionFilter,
  PartnerDispositionRow,
  PartnerSummary,
  TerritoryOption,
} from "./partner-disposition.types";

// Legacy ApiEndPoint.js:
//   ROLE_GET            = /alpha/v1/employee  (with optional ?territory_id=)
//   LEAST_TERRITORY     = /alpha/v1/user/least/territory
//   PARTNER_DISPOSITION = /alpha/v1/report/partner-disposition
const ROLE_GET_URL = "/alpha/v1/employee";
const LEAST_TERRITORY_URL = "/alpha/v1/user/least/territory";
const PARTNER_DISPOSITION_URL = "/alpha/v1/report/partner-disposition";

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
    queryKey: ["partner-disp-employees", territoryId ?? ""],
    queryFn: async (): Promise<EmployeeOption[]> => {
      const url = territoryId
        ? `${ROLE_GET_URL}?territory_id=${encodeURIComponent(territoryId)}`
        : ROLE_GET_URL;
      const body = await api.get<unknown, ApiDataResponse<EmployeeOption[]>>(url);
      return body?.data ?? [];
    },
  });
}

// Summary call — same endpoint, NO scope. Legacy reads:
//   response.data.data.sales   (unused in UI)
//   response.data.summary      (cards) — note top-level `summary`, not `data.summary`
export interface PartnerSummaryResult {
  sales: unknown[];
  summary: PartnerSummary;
}

interface SummaryEnvelope {
  data?: { sales?: unknown[] } | null;
  summary?: PartnerSummary | null;
}

export function usePartnerSummary(filter: PartnerDispositionFilter) {
  const qs: string[] = [];
  if (filter.territoryId) qs.push(`territoryId=${encodeURIComponent(filter.territoryId)}`);
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  if (filter.userId) qs.push(`userId=${encodeURIComponent(filter.userId)}`);
  const url =
    qs.length > 0 ? `${PARTNER_DISPOSITION_URL}?${qs.join("&")}` : PARTNER_DISPOSITION_URL;

  return useQuery({
    queryKey: [
      "partner-disp-summary",
      filter.startDate ?? "",
      filter.endDate ?? "",
      filter.territoryId ?? "",
      filter.userId ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PartnerSummaryResult> => {
      const body = await api.get<unknown, SummaryEnvelope>(url);
      return {
        sales: Array.isArray(body?.data?.sales) ? body!.data!.sales! : [],
        summary: body?.summary && typeof body.summary === "object" ? body.summary : {},
      };
    },
  });
}

// Stream call — same endpoint, `scope=PARTNER_FLOW`. Uses camelCase
// `startDate`/`endDate` (legacy inconsistency — verbatim).
export function usePartnerDispositionStream(filter: PartnerDispositionFilter) {
  const qs: string[] = ["scope=PARTNER_FLOW"];
  if (filter.territoryId) qs.push(`territoryId=${encodeURIComponent(filter.territoryId)}`);
  if (filter.startDate) qs.push(`startDate=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`endDate=${encodeURIComponent(filter.endDate)}`);
  if (filter.userId) qs.push(`userId=${encodeURIComponent(filter.userId)}`);
  const url = `${PARTNER_DISPOSITION_URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: [
      "partner-disp-stream",
      filter.startDate ?? "",
      filter.endDate ?? "",
      filter.territoryId ?? "",
      filter.userId ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PartnerDispositionRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<PartnerDispositionRow[]>>(url);
      return body?.data ?? [];
    },
  });
}
