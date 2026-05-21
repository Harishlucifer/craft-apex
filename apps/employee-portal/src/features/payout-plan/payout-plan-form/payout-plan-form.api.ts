import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeRoleRow,
  LenderOption,
  LoanTypeOption,
  LookupItem,
  PayoutPlanDetail,
  PayoutPlanSavePayload,
  SchemeRow,
  TerritoryRow,
  TerritoryTypeRow,
} from "./payout-plan-form.types";

const PAYOUT_URL = "/alpha/v1/finance/payout-plan";
const SCHEME_URL = "/alpha/v1/finance/scheme";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=PARTNER_CATEGORY,PAYOUT_USER_TYPE,PARTNER_TYPE,PAYOUT_SCOPE,PAYOUT_INTERVAL,PAYABLE";
const TERRITORY_URL = "/alpha/v1/master/territory";
const TERRITORY_TYPE_URL = "/alpha/v1/master/territory-type";
const EMPLOYEE_ROLE_URL = "/alpha/v1/master/user-role";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";

export function usePayoutLookups() {
  return useQuery({
    queryKey: ["lookup", "payout-bundle"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function usePayoutTerritories() {
  return useQuery({
    queryKey: ["territory-master"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}

export function usePayoutTerritoryTypes() {
  return useQuery({
    queryKey: ["territory-type-master"],
    queryFn: async (): Promise<TerritoryTypeRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryTypeRow[]) : [];
    },
  });
}

export function usePayoutEmployeeRoles() {
  return useQuery({
    queryKey: ["employee-roles"],
    queryFn: async (): Promise<EmployeeRoleRow[]> => {
      const body = await api.get<unknown, any>(EMPLOYEE_ROLE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as EmployeeRoleRow[]) : [];
    },
  });
}

export function usePayoutLenders() {
  return useQuery({
    queryKey: ["lender-master-payout"],
    queryFn: async (): Promise<LenderOption[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderOption[]) : [];
    },
  });
}

export function usePayoutLoanTypes() {
  return useQuery({
    queryKey: ["loan-type-master-payout"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

export function usePublishedSchemes(mode: "payable" | "receivable") {
  return useQuery({
    queryKey: ["finance-schemes", mode],
    queryFn: async (): Promise<SchemeRow[]> => {
      const body = await api.get<unknown, any>(
        `${SCHEME_URL}?published=1&mode=${mode}`
      );
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as SchemeRow[]) : [];
    },
  });
}

export function usePayoutPlanDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["payout-plan-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<PayoutPlanDetail | null> => {
      const body = await api.get<unknown, any>(
        `${PAYOUT_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as PayoutPlanDetail | null;
    },
  });
}

export function useSavePayoutPlan() {
  return useMutation({
    mutationFn: async (payload: PayoutPlanSavePayload) =>
      api.post<unknown, any>(PAYOUT_URL, payload),
  });
}
