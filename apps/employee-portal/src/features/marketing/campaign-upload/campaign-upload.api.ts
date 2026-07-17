import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CampaignUploadRow } from "./campaign-upload.types";

const URL = "/alpha/v1/marketing/campaign/upload";

export function useCampaignUploads(attribution: string) {
  return useQuery({
    queryKey: ["campaign-uploads", attribution],
    queryFn: async (): Promise<CampaignUploadRow[]> => {
      const body = await api.get<unknown, any>(
        `${URL}?attribution=${encodeURIComponent(attribution)}`
      );
      const arr =
        (Array.isArray(body?.result) && body.result) ||
        (Array.isArray(body?.data) && body.data) ||
        (Array.isArray(body) && body) ||
        [];
      return arr as CampaignUploadRow[];
    },
  });
}

/** Upload an audience file for a campaign (data_source UPLOAD). */
export function useUploadCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      file,
    }: {
      campaignId: string;
      file: File;
    }) => {
      const form = new FormData();
      form.append("campaign_id", campaignId);
      form.append("data_source", "UPLOAD");
      form.append("document", file); // backend reads c.FormFile("document")
      return api.post<unknown, unknown>(URL, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-uploads"] });
    },
  });
}
