import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChannelListResponse } from "./channel-list.types";

// Legacy: axios.get(`/alpha/v1/channel?status=${channelStatus}&page=${page}[&journey_type=][&exclude_journey_type=]`)
function buildUrl(params: {
  status: string;
  page: number;
  journeyType?: string;
  excludeJourneys?: string;
}): string {
  let url = `/alpha/v1/channel?status=${encodeURIComponent(params.status)}&page=${params.page}`;
  if (params.journeyType)
    url += `&journey_type=${encodeURIComponent(params.journeyType)}`;
  if (params.excludeJourneys)
    url += `&exclude_journey_type=${encodeURIComponent(params.excludeJourneys)}`;
  return url;
}

export function useChannelList(params: {
  status: string;
  page: number;
  journeyType?: string;
  excludeJourneys?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: [
      "channel-list",
      params.status,
      params.page,
      params.journeyType ?? "",
      params.excludeJourneys ?? "",
    ],
    enabled: params.enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ChannelListResponse> =>
      api.get<unknown, ChannelListResponse>(buildUrl(params)),
  });
}
