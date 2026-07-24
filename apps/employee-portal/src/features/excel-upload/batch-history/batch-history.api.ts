import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BatchRow } from "./batch-history.types";

const URL_BATCH = "/alpha/v1/excel-upload/batch";

export function useBatchList(status: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["excel-upload", "batches", status, page, pageSize],
    queryFn: async (): Promise<{ rows: BatchRow[]; total: number }> => {
      const qs = new URLSearchParams({ page: String(page), per_page: String(pageSize) });
      if (status) qs.set("status", status);
      const body = (await api.get<unknown, unknown>(`${URL_BATCH}?${qs.toString()}`)) as {
        result?: BatchRow[];
        data?: BatchRow[];
        meta?: { total?: number };
      };
      const rows = body?.result ?? body?.data ?? [];
      return { rows: Array.isArray(rows) ? rows : [], total: body?.meta?.total ?? rows.length };
    },
  });
}
