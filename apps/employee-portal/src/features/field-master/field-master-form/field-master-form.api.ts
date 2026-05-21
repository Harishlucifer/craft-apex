import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  FieldMasterDetail,
  FieldMasterSavePayload,
} from "./field-master-form.types";

const URL = "/alpha/v1/master/field-master";

export function useFieldMasterDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["field-master-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<FieldMasterDetail | null> => {
      // Legacy: GET /alpha/v1/master/field-master returns array; find by id locally.
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      const list = Array.isArray(arr) ? (arr as FieldMasterDetail[]) : [];
      return (
        list.find((r) => String(r.id) === String(id)) ?? null
      );
    },
  });
}

export function useSaveFieldMaster() {
  return useMutation({
    mutationFn: async (payload: FieldMasterSavePayload) =>
      api.post<unknown, any>(URL, payload),
  });
}
