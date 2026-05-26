import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChannelListResponse,
  EstimateListPayload,
  EstimateListResponse,
  TerritoryMaster,
  TerritoryMasterResponse,
  TerritoryTypeItem,
  TerritoryUserResponse,
} from "./sales-payable-earnings.types";

// Legacy endpoints — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_ESTIMATE = "/alpha/v1/finance/estimate"; // GET_ESTIMATE
const URL_TERRITORY_MASTER = "/alpha/v1/master/territory"; // TERRITORY_MASTER
const URL_TERRITORY_USER = "/alpha/v1/master/territory/user"; // TERRITORY_USER
const URL_CHANNEL_LIST = "/alpha/v1/channel"; // CHANNEL_LIST

export interface EstimateQueryArgs {
  // module.configuration.category — drives `category=` query param
  category?: string;
  territory_id?: string;
  channel_id?: string;
  month?: string;
}

// Legacy fetchEstimateList (Estimate.js): mode is hardcoded to "PAYABLE",
// non-EMPLOYEE branch uses user_type=CHANNEL & associate_id=channel_id:
//   `${GET_ESTIMATE}?mode=PAYABLE&category=${category}&user_type=CHANNEL
//     &associate_id=${channel_id}&territory_id=${territory_id||""}&month=${month||""}`
function buildEstimateUrl(args: EstimateQueryArgs): string {
  const { category, territory_id, channel_id, month } = args;
  const categoryParam = category ? `category=${encodeURIComponent(category)}&` : "";
  const userParam = channel_id
    ? `user_type=CHANNEL&associate_id=${encodeURIComponent(channel_id)}`
    : "";
  return (
    `${URL_ESTIMATE}?mode=PAYABLE&${categoryParam}${userParam}` +
    `&territory_id=${territory_id ? encodeURIComponent(territory_id) : ""}` +
    `&month=${month ? encodeURIComponent(month) : ""}`
  );
}

export function useSalesPayableEarnings(
  args: EstimateQueryArgs,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [
      "finance-sales-payable-earnings",
      args.category ?? "",
      args.territory_id ?? "",
      args.channel_id ?? "",
      args.month ?? "",
    ],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EstimateListPayload> => {
      const body = await api.get<unknown, EstimateListResponse>(
        buildEstimateUrl(args),
      );
      return body?.data ?? {};
    },
  });
}

export function useTerritoryMaster() {
  return useQuery({
    queryKey: ["sales-payable-earnings.territory-master"],
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
    queryKey: ["sales-payable-earnings.territory-user"],
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
    queryKey: ["sales-payable-earnings.channel-list", territoryId],
    enabled: Boolean(territoryId),
    queryFn: async () => {
      const body = await api.get<unknown, ChannelListResponse>(
        `${URL_CHANNEL_LIST}?territory_id=${encodeURIComponent(territoryId)}`,
      );
      return body?.data?.data ?? [];
    },
  });
}
