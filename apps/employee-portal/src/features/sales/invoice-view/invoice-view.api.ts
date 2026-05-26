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
} from "./invoice-view.types";

// Endpoint constants — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_INVOICE = "/alpha/v1/finance/invoice";           // GET_INVOICE_LIST
const URL_TERRITORY_MASTER = "/alpha/v1/master/territory"; // TERRITORY_MASTER
const URL_TERRITORY_USER = "/alpha/v1/master/territory/user"; // TERRITORY_USER
const URL_CHANNEL_LIST = "/alpha/v1/channel";              // CHANNEL_LIST

// Mirrors Invoice.js `getInvoiceList`:
//   No-filter URL:  GET ${URL_INVOICE}?${categoryParam}
//   Filtered URL:   GET ${URL_INVOICE}?${categoryParam}&channelId=…&mode=PAYABLE
//                                       &territory_id=…&month=…
//   At /sales/invoice-view pathname has no payable/receivable/incentive token,
//   so legacy fallback sets estimateMode="PAYABLE" → identical filtered URL.
export interface InvoiceQueryArgs {
  category?: string;
  territory_id?: string;
  channel_id?: string;
  month?: string;
}

function buildInvoiceUrl(args: InvoiceQueryArgs, filtered: boolean): string {
  const { category, territory_id, channel_id, month } = args;
  const categoryParam = category ? `category=${encodeURIComponent(category)}` : "";
  if (!filtered) {
    return `${URL_INVOICE}?${categoryParam}`;
  }
  // EXACT legacy template string (note: `channelId`, not `channel_id`).
  return (
    `${URL_INVOICE}?${categoryParam}` +
    `&channelId=${channel_id ? encodeURIComponent(channel_id) : ""}` +
    `&mode=PAYABLE` +
    `&territory_id=${territory_id ? encodeURIComponent(territory_id) : ""}` +
    `&month=${month ? encodeURIComponent(month) : ""}`
  );
}

export function useSalesInvoiceList(
  args: InvoiceQueryArgs,
  options: { filtered: boolean; enabled?: boolean },
) {
  const { filtered, enabled = true } = options;
  return useQuery({
    queryKey: [
      "sales-invoice-view",
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
    queryKey: ["sales-invoice-view.territory-master"],
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
    queryKey: ["sales-invoice-view.territory-user"],
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
    queryKey: ["sales-invoice-view.channel-list", territoryId],
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
//   ("Capture Invoice" action). Not wired in this port.
// - Legacy InvoiceFilter modal/drawer is rendered inline; the side-drawer
//   variant from other invoice screens is not wired.
// - GENERATE_INCENTIVE (employee-mode column set / EMPLOYEE_INCENTIVE branch)
//   is out of scope here.
