import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeListResponse,
  TargetReportPayload,
  TargetReportResponse,
  TargetReportResult,
} from "./sales-performance-overview.types";

// Endpoints verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_EMPLOYEE_LIST = "/alpha/v2/master/employees"; // NEW_EMPLOYEE_LIST
const URL_TARGET_REPORT = "/alpha/v1/report/employee-targets"; // EMPLOYEE_TARGET_REPORT

// Legacy fetchEmployees: GET /alpha/v2/master/employees?keyword=…&page=…&size=10
export function useEmployeeSearch(keyword: string, page: number) {
  return useQuery({
    queryKey: ["sales-performance-overview.employees", keyword, page],
    queryFn: async () => {
      const body = await api.get<unknown, EmployeeListResponse>(
        `${URL_EMPLOYEE_LIST}?keyword=${encodeURIComponent(
          keyword,
        )}&page=${page}&size=10`,
      );
      return body?.data?.data ?? [];
    },
  });
}

// Legacy handleGenerateReport: POST /alpha/v1/report/employee-targets
// body: { employee_id, month: "MM", year: "YYYY" }
// returns response.data.result (TargetReportResult)
export function useGenerateTargetReport() {
  return useMutation({
    mutationFn: async (
      payload: TargetReportPayload,
    ): Promise<TargetReportResult | null> => {
      const body = await api.post<unknown, TargetReportResponse>(
        URL_TARGET_REPORT,
        payload,
      );
      return body?.data?.result ?? null;
    },
  });
}
