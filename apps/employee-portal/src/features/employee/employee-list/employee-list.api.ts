import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmployeeListResponse } from "./employee-list.types";

// Legacy: axios.get /alpha/v2/master/employees?page=N -> { data, pagination:{total} }
function buildUrl(page: number): string {
  return `/alpha/v2/master/employees?page=${page}`;
}

export function useEmployeeList(page: number) {
  return useQuery({
    queryKey: ["employee-list", page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EmployeeListResponse> => {
      return api.get<unknown, EmployeeListResponse>(buildUrl(page));
    },
  });
}
