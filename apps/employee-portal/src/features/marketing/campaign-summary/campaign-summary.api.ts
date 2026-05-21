import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CampaignSummaryFilter,
  CampaignSummaryResult,
} from "./campaign-summary.types";

const URL = "/alpha/v1/marketing/campaign/summary";

// Legacy maps internal status filter values to API string values.
const STATUS_API_MAP: Record<string, string> = {
  active: "1",
  scheduled: "2",
  inactive: "-1",
};

export function useCampaignSummary(filter: CampaignSummaryFilter) {
  const qs: string[] = [`attribution=${encodeURIComponent(filter.attribution)}`];
  if (filter.status && filter.status !== "all") {
    qs.push(`status=${encodeURIComponent(STATUS_API_MAP[filter.status] ?? filter.status)}`);
  }
  if (filter.dataSource && filter.dataSource !== "all") {
    qs.push(`data_source=${encodeURIComponent(filter.dataSource)}`);
  }
  if (filter.from) qs.push(`from=${encodeURIComponent(filter.from)}`);
  if (filter.to) qs.push(`to=${encodeURIComponent(filter.to)}`);
  const url = `${URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: [
      "campaign-summary",
      filter.attribution,
      filter.status ?? "all",
      filter.dataSource ?? "all",
      filter.from ?? "",
      filter.to ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CampaignSummaryResult> => {
      const body = await api.get<unknown, any>(url);
      const result = body?.result ?? body?.data?.result ?? body?.data ?? {};
      return {
        campaigns: Array.isArray(result?.campaigns) ? result.campaigns : [],
      };
    },
  });
}
