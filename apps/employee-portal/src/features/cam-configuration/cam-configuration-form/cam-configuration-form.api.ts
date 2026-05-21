import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CamConfigDetail,
  CamConfigSavePayload,
  IdNameRow,
  LookupItem,
  NotificationTemplateRow,
} from "./cam-configuration-form.types";

const SAVE_URL = "/alpha/v1/master/cam-configuration";
const LOOKUP_BASE = "/alpha/v1/lookup?group_code=";
const FORM_LOOKUPS =
  "CAM_TYPE,APPLY_CAPACITY,APPLICANT_TYPE,CONFIGURATION_APPLY_FOR";

export function useCamFormLookups() {
  return useQuery({
    queryKey: ["cam-form-lookups"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_BASE + FORM_LOOKUPS);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

/** Product code list — driven by the selected CAM_TYPE value as a lookup group. */
export function useProductCodeLookups(groupCode: string | undefined) {
  return useQuery({
    queryKey: ["product-code-lookup", groupCode ?? ""],
    enabled: Boolean(groupCode),
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(
        `${LOOKUP_BASE}${encodeURIComponent(groupCode!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-options"],
    queryFn: async (): Promise<IdNameRow[]> => {
      const body = await api.get<unknown, any>("/alpha/v1/master/loan-type");
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as IdNameRow[]) : [];
    },
  });
}

export function useRuleOptions() {
  return useQuery({
    queryKey: ["rule-options"],
    queryFn: async (): Promise<IdNameRow[]> => {
      const body = await api.get<unknown, any>("/alpha/v1/rule");
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as IdNameRow[]) : [];
    },
  });
}

export function useNotificationTemplateOptions() {
  return useQuery({
    queryKey: ["notification-template-options"],
    queryFn: async (): Promise<NotificationTemplateRow[]> => {
      const body = await api.get<unknown, any>(
        "/alpha/v1/notification/template"
      );
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as NotificationTemplateRow[]) : [];
    },
  });
}

export function useCamConfigDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["cam-config-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<CamConfigDetail | null> => {
      const body = await api.get<unknown, any>(`${SAVE_URL}/${id}`);
      return body?.result ?? null;
    },
  });
}

export function useSaveCamConfig() {
  return useMutation({
    mutationFn: async (payload: CamConfigSavePayload) =>
      api.post<unknown, unknown>(SAVE_URL, payload),
  });
}
