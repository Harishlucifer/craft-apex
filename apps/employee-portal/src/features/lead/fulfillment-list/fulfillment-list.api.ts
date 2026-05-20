import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FulfillmentListResponse } from "./fulfillment-list.types";

// Legacy: GetCall(`/alpha/v1/application?page=${page}[&journey_type=][&exclude_journey_type=]`)
function buildUrl(p: {
  page: number;
  journeyType?: string;
  excludeJourneys?: string;
}): string {
  let url = `/alpha/v1/application?page=${p.page}`;
  if (p.journeyType)
    url += `&journey_type=${encodeURIComponent(p.journeyType)}`;
  if (p.excludeJourneys)
    url += `&exclude_journey_type=${encodeURIComponent(p.excludeJourneys)}`;
  return url;
}

export function useFulfillmentList(params: {
  page: number;
  journeyType?: string;
  excludeJourneys?: string;
}) {
  return useQuery({
    queryKey: [
      "fulfillment-list",
      params.page,
      params.journeyType ?? "",
      params.excludeJourneys ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<FulfillmentListResponse> =>
      api.get<unknown, FulfillmentListResponse>(buildUrl(params)),
  });
}
