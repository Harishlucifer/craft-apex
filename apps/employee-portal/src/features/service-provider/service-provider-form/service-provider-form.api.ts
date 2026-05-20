import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LookupItem,
  ServiceProviderPayload,
} from "./service-provider-form.types";

// Legacy: GetCall(`/alpha/v1/lookup?group_code=SERVICE_PROVIDER_TYPE,COMMUNICATION_PROVIDER_TYPE,OCR_PROVIDER_TYPE,E-SIGN_PROVIDER_TYPE`)
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=SERVICE_PROVIDER_TYPE,COMMUNICATION_PROVIDER_TYPE,OCR_PROVIDER_TYPE,E-SIGN_PROVIDER_TYPE";

export function useServiceProviderLookups() {
  return useQuery({
    queryKey: ["service-provider-lookups"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

// Legacy: PostCall(APIENDPOINTS.SERVICE_PROVIDER, payload)
const SAVE_URL = "/alpha/v1/master/service-provider";

export function useSaveServiceProvider() {
  return useMutation({
    mutationFn: async (payload: ServiceProviderPayload) =>
      api.post<unknown, unknown>(SAVE_URL, payload),
  });
}
