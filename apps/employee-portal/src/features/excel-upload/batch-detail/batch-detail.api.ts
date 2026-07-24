import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BatchDetail, BatchRowResult } from "./batch-detail.types";

const URL_BATCH = "/alpha/v1/excel-upload/batch";

function unwrap<T>(body: unknown, fallback: T): T {
  const inner = (body as { result?: T; data?: T })?.result
    ?? (body as { result?: T; data?: T })?.data;
  return inner !== undefined ? inner : fallback;
}

const NON_TERMINAL = new Set(["VALIDATING", "COMMITTING"]);

export function useBatchDetail(id?: string) {
  return useQuery({
    queryKey: ["excel-upload", "batch", id],
    queryFn: async (): Promise<BatchDetail | null> => {
      const body = await api.get<unknown, unknown>(`${URL_BATCH}/${id}`);
      return unwrap<BatchDetail | null>(body, null);
    },
    enabled: Boolean(id),
    // Poll while validation/commit is running (US-04) — no websocket in V1.
    refetchInterval: (query) => (query.state.data && NON_TERMINAL.has(query.state.data.status) ? 2500 : false),
  });
}

export function useBatchRows(id: string | undefined, resultFilter: string, page: number) {
  return useQuery({
    queryKey: ["excel-upload", "batch", id, "rows", resultFilter, page],
    queryFn: async (): Promise<{ rows: BatchRowResult[]; total: number }> => {
      const qs = new URLSearchParams({ page: String(page), per_page: "50" });
      if (resultFilter) qs.set("result", resultFilter);
      const body = (await api.get<unknown, unknown>(`${URL_BATCH}/${id}/rows?${qs.toString()}`)) as {
        result?: BatchRowResult[];
        data?: BatchRowResult[];
        meta?: { total?: number };
      };
      const rows = body?.result ?? body?.data ?? [];
      return { rows: Array.isArray(rows) ? rows : [], total: body?.meta?.total ?? rows.length };
    },
    enabled: Boolean(id),
  });
}

export function useCommitBatch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (typedConfirmation: string) =>
      api.post<unknown, unknown>(`${URL_BATCH}/${id}/commit`, { typed_confirmation: typedConfirmation }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["excel-upload", "batch", id] }),
  });
}

export function useUndoBatch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post<unknown, unknown>(`${URL_BATCH}/${id}/undo`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["excel-upload", "batch", id] }),
  });
}

export function errorFileUrl(id: string) {
  return `${URL_BATCH}/${id}/error-file`;
}
