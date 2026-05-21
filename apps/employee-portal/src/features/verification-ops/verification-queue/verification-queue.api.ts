import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VerificationRow } from "./verification-queue.types";

const URL = "/alpha/v1/verification/list";

export function useVerificationList() {
  return useQuery({
    queryKey: ["verification-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<VerificationRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as VerificationRow[]) : [];
    },
  });
}
