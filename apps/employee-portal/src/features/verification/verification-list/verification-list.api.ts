import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VerificationListResponse } from "./verification-list.types";

// Legacy:
//   axios.get(`/alpha/v1/verification/list?self=true&page=${N}`)  -> verification queue
//   axios.get(`/alpha/v1/verification/list?page=${N}`)            -> task list
function buildUrl(page: number, self: boolean): string {
  return `/alpha/v1/verification/list?${self ? "self=true&" : ""}page=${page}`;
}

export function useVerificationList(params: { page: number; self: boolean }) {
  return useQuery({
    queryKey: ["verification-list", params.self ? "queue" : "task", params.page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<VerificationListResponse> =>
      api.get<unknown, VerificationListResponse>(
        buildUrl(params.page, params.self)
      ),
  });
}
