import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserLoginReportResponse } from "./user-login-report.types";

// Legacy: GetCall(APIENDPOINTS.GET_USER_LOGIN_REPORT + "?" + filters + "&page=" + N)
function buildUrl(page: number): string {
  return `/alpha/v1/report/user-login-report?page=${page}`;
}

export function useUserLoginReport(page: number) {
  return useQuery({
    queryKey: ["user-login-report", page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<UserLoginReportResponse> =>
      api.get<unknown, UserLoginReportResponse>(buildUrl(page)),
  });
}
