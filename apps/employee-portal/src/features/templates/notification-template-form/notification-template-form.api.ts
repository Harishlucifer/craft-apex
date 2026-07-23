import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LookupItem,
  ParameterRow,
  TemplateDetail,
} from "./notification-template-form.types";

// Legacy craft-frontend/src/pages/Templates/{index,Providers,Templates}.js
// GET  /alpha/v1/notification/template?id=X -> data.result[0]
// GET  /alpha/v1/lookup?group_code=COMMUNICATION_PROVIDER_TYPE
// GET  /alpha/v1/parameter                  -> data.data (parameter list)
// POST /alpha/v1/master/service-provider    -> Add/Edit Service Provider
// (legacy Templates/Providers.js — the lightweight in-wizard provider
// editor, not the standalone Service Provider master's own save endpoint
// shape). The template save itself goes through the workflow-runtime's
// saveStepData (see COMMUNICATION_TEMPLATE_CREATION in
// workflow-runtime.api.ts) rather than a bespoke useSaveTemplate mutation.
const TEMPLATE_URL = "/alpha/v1/notification/template";
const PARAMETERS_URL = "/alpha/v1/parameter";
const PROVIDER_URL = "/alpha/v1/master/service-provider";
const PROVIDER_TYPE_LOOKUP =
  "/alpha/v1/lookup?group_code=COMMUNICATION_PROVIDER_TYPE";

// Legacy serviceProviderType.Communication
export const COMMUNICATION_PROVIDER_TYPE = "COMMUNICATION";

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

export interface SaveProviderInput {
  id?: string | number | bigint;
  name: string;
  external_id?: string;
  type: string;
  status: number;
  credentials: unknown;
}

export function useSaveCommunicationProvider() {
  return useMutation({
    mutationFn: async (v: SaveProviderInput) =>
      api.post<unknown, unknown>(PROVIDER_URL, {
        // ServiceProviderParams.ID is a plain Go int64 — must round-trip as a
        // real number (see SelectedProvider's doc comment for why bigint).
        ...(v.id != null && v.id !== ""
          ? { id: typeof v.id === "bigint" ? v.id : BigInt(v.id) }
          : {}),
        name: v.name,
        external_id: v.external_id ?? "",
        provider_type: COMMUNICATION_PROVIDER_TYPE,
        type: v.type,
        status: v.status,
        credentials: v.credentials,
      }),
  });
}

export function useTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["notification-template-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<TemplateDetail | null> => {
      const body = await api.get<unknown, any>(
        `${TEMPLATE_URL}?id=${encodeURIComponent(id!)}`,
      );
      const arr = body?.result ?? body?.data ?? body;
      const first = Array.isArray(arr) ? (arr[0] as TemplateDetail) : null;
      return first ?? null;
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
