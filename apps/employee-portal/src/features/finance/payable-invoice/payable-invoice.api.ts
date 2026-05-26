import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChannelListResponse,
  InvoiceListPayload,
  InvoiceListResponse,
  TerritoryMaster,
  TerritoryMasterResponse,
  TerritoryTypeItem,
  TerritoryUserResponse,
} from "./payable-invoice.types";

// Legacy endpoint constants — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_INVOICE = "/alpha/v1/finance/invoice";        // GET_INVOICE_LIST
const URL_TERRITORY_MASTER = "/alpha/v1/master/territory"; // TERRITORY_MASTER
const URL_TERRITORY_USER = "/alpha/v1/master/territory/user"; // TERRITORY_USER
const URL_CHANNEL_LIST = "/alpha/v1/channel";              // CHANNEL_LIST

// Legacy moduleName plumbing: the wrapper passes "EMPLOYEE_INVOICE". The legacy
// PAYABLE-mode list call uses `mode=PAYABLE` only when filters are submitted
// (capSubBtnStatus branch in Invoice.js getInvoiceList).
export interface InvoiceQueryArgs {
  // module.configuration.category — drives `category=` query param
  category?: string;
  // When all four are present, legacy fires the "filtered" URL variant.
  territory_id?: string;
  channel_id?: string;
  month?: string;
}

// Build the URL exactly as legacy Invoice.js getInvoiceList does.
//   No-filter:  GET ${URL_INVOICE}?${categoryParam}
//   Filtered:   GET ${URL_INVOICE}?${categoryParam}&channelId=…&mode=PAYABLE
//                                  &territory_id=…&month=…
function buildInvoiceUrl(args: InvoiceQueryArgs, filtered: boolean): string {
  const { category, territory_id, channel_id, month } = args;
  const categoryParam = category ? `category=${encodeURIComponent(category)}` : "";
  if (!filtered) {
    return `${URL_INVOICE}?${categoryParam}`;
  }
  // Mirrors legacy template-string EXACTLY (note: `channelId` not `channel_id`).
  return (
    `${URL_INVOICE}?${categoryParam}` +
    `&channelId=${channel_id ? encodeURIComponent(channel_id) : ""}` +
    `&mode=PAYABLE` +
    `&territory_id=${territory_id ? encodeURIComponent(territory_id) : ""}` +
    `&month=${month ? encodeURIComponent(month) : ""}`
  );
}

export function usePayableInvoiceList(
  args: InvoiceQueryArgs,
  options: { filtered: boolean; enabled?: boolean },
) {
  const { filtered, enabled = true } = options;
  return useQuery({
    queryKey: [
      "finance-payable-invoice",
      filtered,
      args.category ?? "",
      args.territory_id ?? "",
      args.channel_id ?? "",
      args.month ?? "",
    ],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<InvoiceListPayload> => {
      const body = await api.get<unknown, InvoiceListResponse>(
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
    queryKey: ["payable-invoice.territory-master"],
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
    queryKey: ["payable-invoice.territory-user"],
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

export function useChannelList(territoryId: string) {
  return useQuery({
    queryKey: ["payable-invoice.channel-list", territoryId],
    enabled: Boolean(territoryId),
    queryFn: async () => {
      const body = await api.get<unknown, ChannelListResponse>(
        `${URL_CHANNEL_LIST}?territory_id=${encodeURIComponent(territoryId)}`,
      );
      return body?.data?.data ?? [];
    },
  });
}

// ─── Deferred (legacy capabilities not yet ported) ────────────────────────────
// - Legacy capInvoiceBtnStatus → calls APIENDPOINTS.GENERATE_INVOICE
//     GET /alpha/v1/finance/channel/invoice?channel_id=…&territory_id=…&month=…
//   (the "Capture Invoice" / Generate-Invoice action). Not wired in this port.
// - Legacy InvoiceFilter modal/drawer, batch generation flows, and
//   GENERATE_INCENTIVE (employee-mode) are out of scope here.
