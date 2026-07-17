import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmployeeDetail } from "./profile.types";

const BASE = "/alpha/v1/employee";

/**
 * Upload the logged-in employee's profile photo. The backend stores it on the
 * CDN, saves the URL on the employee record, and returns the public URL.
 */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const body = await api.post<unknown, any>(
    "/alpha/v1/employee/profile-photo",
    form
  );
  return String(body?.profile_image ?? body?.data?.profile_image ?? "");
}

/** Logged-in employee's full record (role, supervisor, office, contact). */
export function useEmployeeDetail(employeeId?: string) {
  return useQuery({
    queryKey: ["employee-detail", employeeId ?? ""],
    enabled: Boolean(employeeId),
    queryFn: async (): Promise<EmployeeDetail | null> => {
      const body = await api.get<unknown, any>(`${BASE}/${employeeId}`);
      return (body?.result ?? body?.data ?? body ?? null) as EmployeeDetail | null;
    },
  });
}

/**
 * Active employees in the same office/branch, excluding the current user.
 * The list endpoint has no office filter, so we fetch the org list (each row
 * carries office_detail) and filter client-side.
 */
export function useBranchColleagues(officeId?: string, excludeEmployeeId?: string) {
  return useQuery({
    queryKey: ["branch-colleagues", officeId ?? ""],
    enabled: Boolean(officeId),
    queryFn: async (): Promise<EmployeeDetail[]> => {
      const body = await api.get<unknown, any>(`${BASE}/?ignore_subordinates=true`);
      const arr =
        (Array.isArray(body?.data) && body.data) ||
        (Array.isArray(body?.result) && body.result) ||
        (Array.isArray(body) && body) ||
        [];
      return (arr as EmployeeDetail[]).filter(
        (e) =>
          e.office_detail?.office_id === officeId &&
          e.employee_id !== excludeEmployeeId
      );
    },
  });
}
