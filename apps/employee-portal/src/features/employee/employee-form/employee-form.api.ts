import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeDetail,
  EmployeeOption,
  EmployeeSavePayload,
  LookupItem,
  OfficeRow,
  RoleRow,
} from "./employee-form.types";

const EMPLOYEE_URL = "/alpha/v1/employee";
const HIERARCHY_LOOKUP = "/alpha/v1/lookup?group_code=HIERARCHY";
const ROLE_URL = "/alpha/v1/master/user-role";
const EMPLOYEE_OPTIONS_URL = "/alpha/v2/master/employees";
const OFFICE_URL = "/alpha/v1/master/office";

export function useEmployeeHierarchy() {
  return useQuery({
    queryKey: ["lookup", "HIERARCHY"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(HIERARCHY_LOOKUP);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useEmployeeRoles() {
  return useQuery({
    queryKey: ["employee-role-list"],
    queryFn: async (): Promise<RoleRow[]> => {
      const body = await api.get<unknown, any>(ROLE_URL);
      const arr = body?.data ?? body?.result ?? body;
      const list = Array.isArray(arr) ? (arr as RoleRow[]) : [];
      // Legacy filter: userType === "EMPLOYEE"
      return list.filter((r) => r.userType === "EMPLOYEE");
    },
  });
}

export function useEmployeeReportsTo() {
  return useQuery({
    queryKey: ["employee-options"],
    queryFn: async (): Promise<EmployeeOption[]> => {
      const body = await api.get<unknown, any>(EMPLOYEE_OPTIONS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as EmployeeOption[]) : [];
    },
  });
}

export function useOffices() {
  return useQuery({
    queryKey: ["office-master"],
    queryFn: async (): Promise<OfficeRow[]> => {
      const body = await api.get<unknown, any>(OFFICE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as OfficeRow[]) : [];
    },
  });
}

export function useEmployeeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["employee-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<EmployeeDetail | null> => {
      const body = await api.get<unknown, any>(
        `${EMPLOYEE_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as EmployeeDetail | null;
    },
  });
}

export function useSaveEmployee() {
  return useMutation({
    mutationFn: async (payload: EmployeeSavePayload) =>
      api.post<unknown, any>(EMPLOYEE_URL, payload),
  });
}
