import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy /Components/Common/BusinessCard.js
//   POST /alpha/v1/user/business-card -> { status: 1, result: imageUrl, download_url }
//   POST /alpha/v1/shortener/create   -> { result: { short_url } }
const BUSINESS_CARD_URL = "/alpha/v1/user/business-card";
const SHORTENER_URL = "/alpha/v1/shortener/create";

export interface BusinessCardResult {
  imageUrl: string;
  downloadUrl?: string;
}

export function useBusinessCard() {
  return useQuery({
    queryKey: ["business-card"],
    queryFn: async (): Promise<BusinessCardResult> => {
      // Legacy uses POST with empty body — the endpoint reads the auth
      // headers to identify the current user.
      const body = await api.post<unknown, any>(BUSINESS_CARD_URL, {});
      if (body?.status === 1 && body?.result) {
        return { imageUrl: body.result, downloadUrl: body.download_url };
      }
      throw new Error("Failed to generate business card");
    },
  });
}

export function useShortenUrl() {
  return useMutation({
    mutationFn: async (originalUrl: string): Promise<string> => {
      const body = await api.post<unknown, any>(SHORTENER_URL, {
        original_url: originalUrl,
      });
      return body?.result?.short_url ?? originalUrl;
    },
  });
}
