import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EstimateResponse,
  EstimateRow,
  LenderMasterResponse,
  LoanTypeMasterResponse,
  LookupOption,
  ReceivableEstimateFilters,
  TerritoryMasterRow,
  TerritoryUserResponse,
} from "./receivable-estimate.types";

// Endpoint constants resolved verbatim from
// craft-frontend/src/Components/helper/ApiEndPoint.js
const GET_ESTIMATE = "/alpha/v1/finance/estimate";
const LENDER_GET = "/alpha/v1/master/lender";
const LOAN_TYPE_MASTER = "/alpha/v1/master/loan-type";
const TERRITORY_MASTER = "/alpha/v1/master/territory";
const TERRITORY_USER = "/alpha/v1/master/territory/user";

// Legacy moduleName === "PARTNER" so user_type/associate_id is "CHANNEL" + channel_id.
// The Receivable form has no Channel field, so this segment is always omitted —
// matching the legacy condition `formik.values?.channel_id` being falsy.
//
// Legacy:  mode=PAYABLE&category=<...>&territory_id=&month=
// (yes — `mode` is hard-coded "PAYABLE" in legacy fetchEstimateList; preserved.)
function buildEstimateUrl(
  filters: ReceivableEstimateFilters,
  category: string,
): string {
  const params = new URLSearchParams();
  params.set("mode", "PAYABLE");
  if (category) params.set("category", category);
  params.set("territory_id", filters.territory_id || "");
  params.set("month", filters.month || "");
  return `${GET_ESTIMATE}?${params.toString()}`;
}

export interface UseReceivableEstimateOpts {
  category: string; // module.configuration.category — wired as "RECEIVABLE" in legacy
  enabled: boolean;
}

export function useReceivableEstimate(
  filters: ReceivableEstimateFilters,
  opts: UseReceivableEstimateOpts,
) {
  return useQuery({
    queryKey: ["finance-receivable-estimate", opts.category, filters],
    enabled: opts.enabled && Boolean(opts.category),
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EstimateResponse> => {
      const url = buildEstimateUrl(filters, opts.category);
      // Legacy: setEstimateList(estimateRes?.data) then UI reads .data/.summary
      // Under task contract (GetCall resolves to body), body IS that object.
      const body = await api.get<unknown, EstimateResponse>(url);
      return body ?? {};
    },
  });
}

// ---------- Lookups (parallel — mirrors legacy Promise.all in fetchLookups) ----------

export function useReceivableEstimateLookups() {
  return useQuery({
    queryKey: ["finance-receivable-estimate-lookups"],
    queryFn: async () => {
      const [territoryResp, territoryTypeResp, lenderRes, loanTypeRes] =
        await Promise.all([
          api.get<unknown, { data?: TerritoryMasterRow[] }>(TERRITORY_MASTER),
          api.get<unknown, TerritoryUserResponse>(TERRITORY_USER),
          api.get<unknown, LenderMasterResponse>(LENDER_GET),
          api.get<unknown, LoanTypeMasterResponse>(LOAN_TYPE_MASTER),
        ]);

      const lenders: LookupOption[] =
        lenderRes?.result?.map((l) => ({
          label: l?.name ?? "",
          value: String(l?.lender_id ?? ""),
        })) ?? [];

      const loanTypes: LookupOption[] =
        loanTypeRes?.data?.map((l) => ({
          label: l?.name ?? "",
          value: String(l?.id ?? ""),
        })) ?? [];

      const territoryTypes: LookupOption[] =
        territoryTypeResp?.data?.territory_type?.map((t) => ({
          label: t?.name ?? "",
          value: String(t?.id ?? ""),
        })) ?? [];

      const userTerritory: LookupOption[] =
        territoryTypeResp?.data?.territory?.map((t) => ({
          label: t?.name ?? "",
          value: String(t?.id ?? ""),
        })) ?? [];

      const territoryRows: TerritoryMasterRow[] = territoryResp?.data ?? [];

      return { lenders, loanTypes, territoryTypes, userTerritory, territoryRows };
    },
  });
}

export type { EstimateRow };
