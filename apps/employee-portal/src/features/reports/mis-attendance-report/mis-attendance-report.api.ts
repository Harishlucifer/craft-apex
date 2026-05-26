import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiListResponse,
  AttendanceFilter,
  AttendanceRevertPayload,
  AttendanceRevertResponse,
  AttendanceRow,
  AttendanceSummaryPayload,
  AttendanceSummaryRow,
  BranchRow,
  UserRoleRow,
} from "./mis-attendance-report.types";

// Legacy ApiEndPoint.js:
//   EMPLOYEE_ROLE              = /alpha/v1/master/user-role
//   USER_LEAST_TERRITORY       = /alpha/v1/user/least/territory
//   ATTENDANCE_REPORT          = /alpha/v1/report/attendance
//   ATTENDANCE_SUMMARY_REPORT  = /alpha/v1/report/attendance-summary
//   REVERT_USER_PUNCH_OUT      = /alpha/v1/user/user-attendance-revert
const EMPLOYEE_ROLE_URL = "/alpha/v1/master/user-role";
const USER_LEAST_TERRITORY_URL = "/alpha/v1/user/least/territory";
const ATTENDANCE_REPORT_URL = "/alpha/v1/report/attendance";
const ATTENDANCE_SUMMARY_URL = "/alpha/v1/report/attendance-summary";
const REVERT_PUNCH_OUT_URL = "/alpha/v1/user/user-attendance-revert";

export function useUserRoles() {
  return useQuery({
    queryKey: ["user-role-master"],
    queryFn: async (): Promise<UserRoleRow[]> => {
      const body = await api.get<unknown, ApiListResponse<UserRoleRow>>(
        EMPLOYEE_ROLE_URL
      );
      return body?.data ?? [];
    },
  });
}

export function useLeastTerritory() {
  return useQuery({
    queryKey: ["user-least-territory"],
    queryFn: async (): Promise<BranchRow[]> => {
      const body = await api.get<unknown, ApiListResponse<BranchRow>>(
        USER_LEAST_TERRITORY_URL
      );
      return body?.data ?? [];
    },
  });
}

function buildAttendanceQuery(f: AttendanceFilter): string {
  // Legacy: when no filter, default to today (YYYY-MM-DD).
  const today = new Date().toISOString().split("T")[0]!;
  const params = new URLSearchParams();
  params.append("date", f.date || today);
  if (f.role_id) params.append("role_id", f.role_id);
  if (f.territoryId) params.append("territoryId", f.territoryId);
  return params.toString();
}

export function useAttendanceList(filter: AttendanceFilter) {
  return useQuery({
    queryKey: [
      "attendance-list",
      filter.date ?? "",
      filter.role_id ?? "",
      filter.territoryId ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<AttendanceRow[]> => {
      const body = await api.get<unknown, ApiListResponse<AttendanceRow>>(
        `${ATTENDANCE_REPORT_URL}?${buildAttendanceQuery(filter)}`
      );
      return body?.data ?? [];
    },
  });
}

// Legacy getAttendanceSummary uses (year, month, 2) for firstDay so the
// ISO-string slice lands on the 1st in UTC despite local TZ — kept verbatim.
export function buildSummaryDateRange(date?: string): {
  start_date: string;
  end_date: string;
} {
  const parsed = date ? new Date(date) : new Date();
  const firstDay = new Date(parsed.getFullYear(), parsed.getMonth(), 2);
  const lastDay = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0);
  const f = (d: Date) => d.toISOString().split("T")[0]!;
  return { start_date: f(firstDay), end_date: f(lastDay) };
}

export function useAttendanceSummary(payload: AttendanceSummaryPayload | null) {
  return useQuery({
    queryKey: [
      "attendance-summary",
      payload?.start_date ?? "",
      payload?.end_date ?? "",
      payload?.role_id ?? "",
      payload?.territory_id ?? "",
    ],
    enabled: payload != null,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<AttendanceSummaryRow[]> => {
      const body = await api.post<unknown, ApiListResponse<AttendanceSummaryRow>>(
        ATTENDANCE_SUMMARY_URL,
        payload
      );
      return body?.data ?? [];
    },
  });
}

export function useRevertPunchOut() {
  return useMutation({
    mutationFn: async (
      payload: AttendanceRevertPayload
    ): Promise<AttendanceRevertResponse> =>
      api.post<unknown, AttendanceRevertResponse>(REVERT_PUNCH_OUT_URL, payload),
  });
}
