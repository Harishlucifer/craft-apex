import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LinkRow } from "./links-list.types";

// Legacy: GetCall(APIENDPOINTS.MARKETING_LINKS) -> response.data.result
const URL = "/alpha/v1/marketing/link";

export function useMarketingLinks() {
  return useQuery({
    queryKey: ["marketing-links"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LinkRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LinkRow[]) : [];
    },
  });
}
