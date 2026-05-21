import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ServiceRequestTypeRow,
  ServiceRequestTypeSavePayload,
} from "./service-request-type.types";

const URL = "/alpha/v1/service/type";

export function useServiceRequestTypeList() {
  return useQuery({
    queryKey: ["service-request-type-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ServiceRequestTypeRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ServiceRequestTypeRow[]) : [];
    },
  });
}

export function useSaveServiceRequestType() {
  return useMutation({
    mutationFn: async (payload: ServiceRequestTypeSavePayload) =>
      api.post<unknown, unknown>(URL, payload),
  });
}
