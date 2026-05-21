import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AudienceRow } from "./campaign-audience.types";

const URL = "/alpha/v1/marketing/audience";

export interface AudienceFilter {
  campaignId?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  status?: string;
}

export function useCampaignAudience(filter: AudienceFilter) {
  const qs: string[] = [];
  if (filter.campaignId) qs.push(`campaign_id=${encodeURIComponent(filter.campaignId)}`);
  if (filter.fromDate) qs.push(`fromDate=${encodeURIComponent(filter.fromDate)}`);
  if (filter.toDate) qs.push(`toDate=${encodeURIComponent(filter.toDate)}`);
  if (filter.status) qs.push(`status=${encodeURIComponent(filter.status)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: [
      "marketing-audience",
      filter.campaignId ?? "",
      filter.fromDate ?? "",
      filter.toDate ?? "",
      filter.status ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<AudienceRow[]> => {
      const body = await api.get<unknown, any>(url);
      // Legacy tried in order: data top-level array, data.data, data.result.
      const arr =
        (Array.isArray(body) && body) ||
        (Array.isArray(body?.data) && body.data) ||
        (Array.isArray(body?.result) && body.result) ||
        [];
      return arr as AudienceRow[];
    },
  });
}
