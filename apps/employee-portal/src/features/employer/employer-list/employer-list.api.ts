import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmployerListResponse } from "./employer-list.types";

// Legacy: GetCall(`/alpha/v1/employer?page=${N}[&keyword=]`)
function buildUrl(page: number, keyword?: string): string {
  let url = `/alpha/v1/employer?page=${page}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  return url;
}

export function useEmployerList(params: { page: number; keyword?: string }) {
  return useQuery({
    queryKey: ["employer-list", params.page, params.keyword ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EmployerListResponse> =>
      api.get<unknown, EmployerListResponse>(
        buildUrl(params.page, params.keyword)
      ),
  });
}
