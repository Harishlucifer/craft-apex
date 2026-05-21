import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LookupItem,
  ParameterRow,
  ServiceProviderRow,
  TemplateDetail,
  TemplateSavePayload,
} from "./notification-template-form.types";

const TEMPLATE_URL = "/alpha/v1/notification/template";
const PROVIDER_URL = "/alpha/v1/master/service-provider";
const PARAMETERS_URL = "/alpha/v1/parameter";
const PROVIDER_TYPE_LOOKUP =
  "/alpha/v1/lookup?group_code=COMMUNICATION_PROVIDER_TYPE";

// Legacy serviceProviderType.Communication
export const COMMUNICATION_PROVIDER_TYPE = "COMMUNICATION";

export function useServiceProviders() {
  return useQuery({
    queryKey: ["service-provider-list"],
    queryFn: async (): Promise<ServiceProviderRow[]> => {
      const body = await api.get<unknown, any>(PROVIDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as ServiceProviderRow[]) : [];
    },
  });
}

export function useCommunicationProviderTypes() {
  return useQuery({
    queryKey: ["lookup", "COMMUNICATION_PROVIDER_TYPE"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(PROVIDER_TYPE_LOOKUP);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useParameterOptions() {
  return useQuery({
    queryKey: ["parameter-list-for-template"],
    queryFn: async (): Promise<ParameterRow[]> => {
      const body = await api.get<unknown, any>(PARAMETERS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterRow[]) : [];
    },
  });
}

export function useTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["notification-template-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<TemplateDetail | null> => {
      const body = await api.get<unknown, any>(
        `${TEMPLATE_URL}?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.result ?? body?.data ?? body;
      const first = Array.isArray(arr) ? (arr[0] as TemplateDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveTemplate() {
  return useMutation({
    mutationFn: async (payload: TemplateSavePayload) =>
      api.post<unknown, unknown>(TEMPLATE_URL, payload),
  });
}

export interface SaveProviderInput {
  id?: string | number;
  name: string;
  external_id?: string;
  type: string;
  status: number;
  credentials: unknown;
}

// Quick-add provider modal inside step 1.
export function useSaveCommunicationProvider() {
  return useMutation({
    mutationFn: async (v: SaveProviderInput) =>
      api.post<unknown, unknown>(PROVIDER_URL, {
        ...(v.id != null && v.id !== "" ? { id: v.id } : {}),
        name: v.name,
        external_id: v.external_id ?? "",
        provider_type: COMMUNICATION_PROVIDER_TYPE,
        type: v.type,
        status: v.status,
        credentials: v.credentials,
      }),
  });
}
