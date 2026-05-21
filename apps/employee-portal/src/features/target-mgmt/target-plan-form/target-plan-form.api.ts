import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeRoleRow,
  LenderOption,
  LoanTypeOption,
  LookupItem,
  TargetPlanDetail,
  TargetPlanSavePayload,
  TerritoryRow,
  TerritoryTypeRow,
} from "./target-plan-form.types";

const PLAN_URL = "/alpha/v1/master/target-plan";
const TERRITORY_URL = "/alpha/v1/master/territory";
const TERRITORY_TYPE_URL = "/alpha/v1/master/territory-type";
const EMPLOYEE_ROLE_URL = "/alpha/v1/master/user-role";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=USER_TYPE,PARTNER_CATEGORY,TARGET_ATTRIBUTES,TARGET_PERIOD,TARGET_TYPE,TARGET_SUB_TYPE";

export function useTargetPlanLookups() {
  return useQuery({
    queryKey: [
      "lookup",
      "USER_TYPE,PARTNER_CATEGORY,TARGET_ATTRIBUTES,TARGET_PERIOD,TARGET_TYPE,TARGET_SUB_TYPE",
    ],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useTerritoryList() {
  return useQuery({
    queryKey: ["territory-master"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}

export function useTerritoryTypeList() {
  return useQuery({
    queryKey: ["territory-type-master"],
    queryFn: async (): Promise<TerritoryTypeRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryTypeRow[]) : [];
    },
  });
}

export function useEmployeeRoles() {
  return useQuery({
    queryKey: ["employee-roles"],
    queryFn: async (): Promise<EmployeeRoleRow[]> => {
      const body = await api.get<unknown, any>(EMPLOYEE_ROLE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as EmployeeRoleRow[]) : [];
    },
  });
}

export function useTargetPlanDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["target-plan-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<TargetPlanDetail | null> => {
      const body = await api.get<unknown, any>(
        `${PLAN_URL}?targetPlanId=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as TargetPlanDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveTargetPlan() {
  return useMutation({
    mutationFn: async (payload: TargetPlanSavePayload) =>
      api.post<unknown, any>(PLAN_URL, payload),
  });
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-master-options"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

export function useLenderOptions() {
  return useQuery({
    queryKey: ["lender-master-options"],
    queryFn: async (): Promise<LenderOption[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderOption[]) : [];
    },
  });
}
