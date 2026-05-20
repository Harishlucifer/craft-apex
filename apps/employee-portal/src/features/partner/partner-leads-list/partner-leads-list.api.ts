import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PartnerLeadsResponse } from "./partner-leads-list.types";

// Legacy: axios.get(`/alpha/v1/channel?status=3&download=false&page=${N}`)
function buildUrl(page: number): string {
  return `/alpha/v1/channel?status=3&download=false&page=${page}`;
}

export function usePartnerLeadsList(page: number) {
  return useQuery({
    queryKey: ["partner-leads-list", page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PartnerLeadsResponse> =>
      api.get<unknown, PartnerLeadsResponse>(buildUrl(page)),
  });
}
