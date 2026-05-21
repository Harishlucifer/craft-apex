import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CampaignDetail,
  CampaignSavePayload,
  LookupItem,
} from "./campaign-form.types";

const CAMPAIGN_URL = "/alpha/v1/marketing/campaign";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=CAMPAIGN_DATA_SOURCE,CAMPAIGN_ATTRIBUTION";

export function useCampaignLookups() {
  return useQuery({
    queryKey: ["lookup", "campaign-bundle"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useCampaignDetail(
  id: string | undefined,
  attribution?: string
) {
  return useQuery({
    queryKey: ["campaign-detail", id ?? "", attribution ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<CampaignDetail | null> => {
      const qs = attribution
        ? `?campaign_id=${encodeURIComponent(id!)}&attribution=${encodeURIComponent(attribution)}`
        : `?campaign_id=${encodeURIComponent(id!)}`;
      const body = await api.get<unknown, any>(`${CAMPAIGN_URL}${qs}`);
      const arr = body?.result ?? body?.data ?? body;
      const first = Array.isArray(arr) ? (arr[0] as CampaignDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveCampaign() {
  return useMutation({
    mutationFn: async (payload: CampaignSavePayload) =>
      api.post<unknown, any>(CAMPAIGN_URL, payload),
  });
}
