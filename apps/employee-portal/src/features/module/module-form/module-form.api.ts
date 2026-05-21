import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LookupItem,
  ModuleDetail,
  ModuleSavePayload,
  ParentModuleOption,
} from "./module-form.types";

// Lookups
const USER_TYPE_URL = "/alpha/v1/lookup?group_code=USER_TYPE";
const MODULE_LIST_URL = "/alpha/v1/master/module";
const MODULE_SAVE_URL = "/alpha/v1/master/module";

export function useUserTypeLookups() {
  return useQuery({
    queryKey: ["lookup", "USER_TYPE"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(USER_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useParentModuleOptions() {
  return useQuery({
    queryKey: ["module-list-for-parent"],
    queryFn: async (): Promise<ParentModuleOption[]> => {
      const body = await api.get<unknown, any>(MODULE_LIST_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParentModuleOption[]) : [];
    },
  });
}

export function useModuleDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["module-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<ModuleDetail | null> => {
      const body = await api.get<unknown, any>(
        `${MODULE_LIST_URL}?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as ModuleDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveModule() {
  return useMutation({
    mutationFn: async (payload: ModuleSavePayload) =>
      api.post<unknown, unknown>(MODULE_SAVE_URL, payload),
  });
}
