import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MediaRow } from "./media-list.types";

// Legacy: GetCall(APIENDPOINTS.MARKETING_MEDIAS) -> response.data.result
const URL = "/alpha/v1/marketing/media";

export function useMarketingMedia() {
  return useQuery({
    queryKey: ["marketing-media"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<MediaRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as MediaRow[]) : [];
    },
  });
}
