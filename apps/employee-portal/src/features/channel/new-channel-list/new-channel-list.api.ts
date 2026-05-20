import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NewChannelListResponse } from "./new-channel-list.types";

// Legacy: axios.get(`/alpha/v1/channel?page=${N}`) — no status filter.
function buildUrl(page: number): string {
  return `/alpha/v1/channel?page=${page}`;
}

export function useNewChannelList(page: number) {
  return useQuery({
    queryKey: ["new-channel-list", page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<NewChannelListResponse> =>
      api.get<unknown, NewChannelListResponse>(buildUrl(page)),
  });
}
