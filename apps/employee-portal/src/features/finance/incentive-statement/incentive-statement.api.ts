import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeListResponse,
  IncentiveListPayload,
  IncentiveListResponse,
  TerritoryMaster,
  TerritoryMasterResponse,
  TerritoryTypeItem,
  TerritoryUserResponse,
} from "./incentive-statement.types";

// Legacy endpoint constants — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_INVOICE = "/alpha/v1/finance/invoice";              // GET_INVOICE_LIST
const URL_TERRITORY_MASTER = "/alpha/v1/master/territory";    // TERRITORY_MASTER
const URL_TERRITORY_USER = "/alpha/v1/master/territory/user"; // TERRITORY_USER
const URL_EMPLOYEE_LIST = "/alpha/v1/employee";               // EMPLOYEE_LIST

// Legacy moduleName="EMPLOYEE_INCENTIVE". INCENTIVE-mode list call uses
// `mode=INCENTIVE` only when filters are submitted (capSubBtnStatus branch
// in Invoice.js getInvoiceList).
export interface IncentiveQueryArgs {
  // module.configuration.category — drives `category=` query param
  category?: string;
  // Legacy uses `channelId=` in the filtered URL even in INCENTIVE mode
  // (template string in Invoice.js getInvoiceList is shared). The legacy
  // EstimateForm in incentive mode leaves channel_id empty.
  territory_id?: string;
  month?: string;
}

// Build the URL exactly as legacy Invoice.js getInvoiceList does.
//   No-filter:  GET ${URL_INVOICE}?${categoryParam}
//   Filtered:   GET ${URL_INVOICE}?${categoryParam}&channelId=&mode=INCENTIVE
//                                  &territory_id=…&month=…
function buildInvoiceUrl(args: IncentiveQueryArgs, filtered: boolean): string {
  const { category, territory_id, month } = args;
  const categoryParam = category ? `category=${encodeURIComponent(category)}` : "";
  if (!filtered) {
    return `${URL_INVOICE}?${categoryParam}`;
  }
  // Mirrors legacy template-string EXACTLY (note: `channelId` not `channel_id`).
  // INCENTIVE branch passes empty channelId — formik.values.channel_id is "".
  return (
    `${URL_INVOICE}?${categoryParam}` +
    `&channelId=` +
    `&mode=INCENTIVE` +
    `&territory_id=${territory_id ? encodeURIComponent(territory_id) : ""}` +
    `&month=${month ? encodeURIComponent(month) : ""}`
  );
}

export function useIncentiveStatementList(
  args: IncentiveQueryArgs,
  options: { filtered: boolean; enabled?: boolean },
) {
  const { filtered, enabled = true } = options;
  return useQuery({
    queryKey: [
      "finance-incentive-statement",
      filtered,
      args.category ?? "",
      args.territory_id ?? "",
      args.month ?? "",
    ],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<IncentiveListPayload> => {
      const body = await api.get<unknown, IncentiveListResponse>(
        buildInvoiceUrl(args, filtered),
      );
      // Legacy reads res.data.data; envelope is { data: { data: InvoiceRow[] } }.
      return body?.data ?? {};
    },
  });
}

// ─── Lookups (fired once; reshape happens in the page) ────────────────────────
export function useTerritoryMaster() {
  return useQuery({
    queryKey: ["incentive-statement.territory-master"],
    queryFn: async (): Promise<TerritoryMaster[]> => {
      const body = await api.get<unknown, TerritoryMasterResponse>(
        URL_TERRITORY_MASTER,
      );
      return body?.data?.data ?? [];
    },
  });
}

export function useTerritoryUser() {
  return useQuery({
    queryKey: ["incentive-statement.territory-user"],
    queryFn: async (): Promise<{
      territory_type: TerritoryTypeItem[];
      territory: TerritoryTypeItem[];
    }> => {
      const body = await api.get<unknown, TerritoryUserResponse>(URL_TERRITORY_USER);
      return {
        territory_type: body?.data?.data?.territory_type ?? [],
        territory: body?.data?.data?.territory ?? [],
      };
    },
  });
}

export function useEmployeeList(territoryId: string) {
  return useQuery({
    queryKey: ["incentive-statement.employee-list", territoryId],
    enabled: Boolean(territoryId),
    queryFn: async () => {
      const body = await api.get<unknown, EmployeeListResponse>(
        `${URL_EMPLOYEE_LIST}?territory_id=${encodeURIComponent(territoryId)}`,
      );
      return body?.data?.data ?? [];
    },
  });
}

// ─── Deferred (legacy capabilities not yet ported) ────────────────────────────
// - Legacy capInvoiceBtnStatus → calls APIENDPOINTS.GENERATE_INCENTIVE
//     GET /alpha/v1/finance/employee/incentive?employee_id=…&territory_id=…&month=…
//   (the "Calculate Incentive" action). Not wired in this port.
// - Invoice detail view, PDF, adjustments, batch flows — out of scope here.
