import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UnderwritingMatrixRow } from "./delegation-matrix-list.types";

const UNDERWRITING_MATRIX_URL = "/alpha/v1/master/underwriting-matrix";

export function useUnderwritingMatrixList() {
  return useQuery({
    queryKey: ["underwriting-matrix-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<UnderwritingMatrixRow[]> => {
      const body = await api.get<unknown, any>(UNDERWRITING_MATRIX_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as UnderwritingMatrixRow[]) : [];
    },
  });
}
