import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ServiceProviderRow } from "./service-provider-list.types";

// Legacy: GetCall(APIENDPOINTS.SERVICE_PROVIDER) -> response.data.result
const URL = "/alpha/v1/master/service-provider";

export function useServiceProviderList() {
  return useQuery({
    queryKey: ["service-provider-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ServiceProviderRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as ServiceProviderRow[]) : [];
    },
  });
}
