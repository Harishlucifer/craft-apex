import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  GroupCodeMap,
  JsonStructSchema,
  ParameterDetail,
  ParameterLookupItem,
  ParameterSavePayload,
  TableSchema,
} from "./parameter-form.types";

const PARAMETER_URL = "/alpha/v1/parameter";
const PARAMETER_TABLE_URL = "/alpha/v1/parameter/table";
const PARAMETER_STRUCT_URL = "/alpha/v1/parameter/struct";
const LOOKUP_GROUP_URL = "/alpha/v1/lookup/group";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=PARAMETER_TYPE,AGGREGATE_OPERATOR,PROGRAMMED_PARAMETER";

export function useParameterLookups() {
  return useQuery({
    queryKey: ["lookup", "PARAMETER_TYPE,AGGREGATE_OPERATOR,PROGRAMMED_PARAMETER"],
    queryFn: async (): Promise<ParameterLookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ParameterLookupItem[]) : [];
    },
  });
}

export function useTableSchema() {
  return useQuery({
    queryKey: ["parameter-table-schema"],
    queryFn: async (): Promise<TableSchema> => {
      const body = await api.get<unknown, any>(PARAMETER_TABLE_URL);
      const data = body?.data ?? body?.result ?? body;
      return (data ?? {}) as TableSchema;
    },
  });
}

export function useJsonStruct() {
  return useQuery({
    queryKey: ["parameter-json-struct"],
    queryFn: async (): Promise<JsonStructSchema> => {
      const body = await api.get<unknown, any>(PARAMETER_STRUCT_URL);
      const data = body?.data ?? body?.result ?? body;
      return (data ?? {}) as JsonStructSchema;
    },
  });
}

export function useLookupGroupCodes() {
  return useQuery({
    queryKey: ["lookup-group-codes"],
    queryFn: async (): Promise<GroupCodeMap> => {
      const body = await api.get<unknown, any>(LOOKUP_GROUP_URL);
      const data = body?.data ?? body?.result ?? body;
      return (data ?? {}) as GroupCodeMap;
    },
  });
}

export function useParameterDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["parameter-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<ParameterDetail | null> => {
      const body = await api.get<unknown, any>(
        `${PARAMETER_URL}/?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as ParameterDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveParameter() {
  return useMutation({
    mutationFn: async (payload: ParameterSavePayload) =>
      api.post<unknown, any>(PARAMETER_URL, payload),
  });
}
