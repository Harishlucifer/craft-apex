import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CampaignRow } from "./campaign-list.types";

// Legacy: GetCall(`/alpha/v1/marketing/campaign?attribution=${attribution}`) -> response.data.result
function buildUrl(attribution?: string): string {
  return attribution
    ? `/alpha/v1/marketing/campaign?attribution=${encodeURIComponent(attribution)}`
    : "/alpha/v1/marketing/campaign";
}

export function useCampaignList(attribution?: string) {
  return useQuery({
    queryKey: ["campaign-list", attribution ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CampaignRow[]> => {
      const body = await api.get<unknown, any>(buildUrl(attribution));
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as CampaignRow[]) : [];
    },
  });
}
