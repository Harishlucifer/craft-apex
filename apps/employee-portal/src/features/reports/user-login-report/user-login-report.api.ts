import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserLoginReportResponse } from "./user-login-report.types";

export interface UserLoginReportFilter {
  startDate?: string;
  endDate?: string;
}

// Legacy GET /alpha/v1/report/user-login-report?{filters}&page=N
// (Reports/UserLoginReport/index.js#getUserLoginReport — filters flattened via
// objectToQueryString and pipe-joined for arrays.)
function buildUrl(page: number, filter: UserLoginReportFilter): string {
  const qs: string[] = [`page=${page}`];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  return `/alpha/v1/report/user-login-report?${qs.join("&")}`;
}

export function useUserLoginReport(page: number, filter: UserLoginReportFilter) {
  return useQuery({
    queryKey: ["user-login-report", page, filter.startDate ?? "", filter.endDate ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<UserLoginReportResponse> =>
      api.get<unknown, UserLoginReportResponse>(buildUrl(page, filter)),
  });
}
