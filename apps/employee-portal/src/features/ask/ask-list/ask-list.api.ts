import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AskListResponse } from "./ask-list.types";

// Legacy: axios.get(`/alpha/v1/application/ask/list?page=${N}`) -> { data, pagination }
function buildUrl(page: number): string {
  return `/alpha/v1/application/ask/list?page=${page}`;
}

export function useAskList(page: number) {
  return useQuery({
    queryKey: ["ask-list", page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<AskListResponse> =>
      api.get<unknown, AskListResponse>(buildUrl(page)),
  });
}
