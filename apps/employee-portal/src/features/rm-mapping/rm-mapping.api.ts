import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderRow,
  LoanTypeRow,
  TerritoryRow,
  TerritoryTypeRow,
  EmployeeRow,
  LookupItem,
} from "./rm-mapping.types";

const TENANT_SETUP_URL = "/alpha/v2/setup/tenant";
const LOOKUP_URL = "/alpha/v1/lookup";
const TERRITORY_TYPE_URL = "/alpha/v1/master/territory-type";
const TERRITORY_URL = "/alpha/v1/master/territory";
const LOAN_TYPE_URL = "/alpha/v1/user/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";
const EMPLOYEE_URL = "/alpha/v1/employee";

export interface TenantSetupData {
  tenant: Record<string, string>;
  user?: Record<string, any>;
  module?: any[];
}

export function useTenantSetup() {
  return useQuery({
    queryKey: ["setup", "tenant"],
    queryFn: async (): Promise<TenantSetupData | null> => {
      const body = await api.post<unknown, any>(TENANT_SETUP_URL, {});
      const data = body?.data ?? body?.result ?? body;
      return (data ?? null) as TenantSetupData | null;
    },
    staleTime: 10 * 60_000, // cache for 10 minutes since setup is static
  });
}

export function useLookupPartnerCategory() {
  return useQuery({
    queryKey: ["lookup", "PARTNER_CATEGORY"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(
        `${LOOKUP_URL}?group_code=PARTNER_CATEGORY`
      );
      const arr = body?.data?.data ?? body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useTerritoryTypes() {
  return useQuery({
    queryKey: ["master", "territory-type", "active"],
    queryFn: async (): Promise<TerritoryTypeRow[]> => {
      const body = await api.get<unknown, any>(`${TERRITORY_TYPE_URL}?status=1`);
      const arr = body?.data?.data ?? body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryTypeRow[]) : [];
    },
  });
}

export function useTerritories() {
  return useQuery({
    queryKey: ["master", "territory", "active"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(`${TERRITORY_URL}?status=1`);
      const arr = body?.data?.data ?? body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}

export function useLoanTypes() {
  return useQuery({
    queryKey: ["user", "loan-type", "active"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(`${LOAN_TYPE_URL}?status=1`);
      const arr = body?.data?.data ?? body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

export function useLenders(loanTypeIds: string[]) {
  const joined = loanTypeIds.length > 0 ? loanTypeIds.join("|") : "0";
  return useQuery({
    queryKey: ["master", "lender", "filtered", joined],
    enabled: loanTypeIds.length > 0,
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(
        `${LENDER_URL}?loan_type_id=${joined}`
      );
      const arr = body?.result ?? body?.data?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}

export function useRelationshipManagers(roleCode: string | undefined) {
  const queryRoleCode = roleCode ?? "";
  return useQuery({
    queryKey: ["employee", "rm", queryRoleCode],
    enabled: queryRoleCode !== "",
    queryFn: async (): Promise<EmployeeRow[]> => {
      const body = await api.get<unknown, any>(
        `${EMPLOYEE_URL}?role_code=${encodeURIComponent(queryRoleCode)}`
      );
      const rawData = body?.data?.data ?? body?.data ?? body?.result ?? body;
      const allAvailableEmployees = Array.isArray(rawData)
        ? (rawData as EmployeeRow[])
        : [];
      const allowedRoles = queryRoleCode ? queryRoleCode.split("|") : [];
      if (allowedRoles.length > 0) {
        return allAvailableEmployees.filter((emp) =>
          allowedRoles.includes(emp.role_code)
        );
      }
      return allAvailableEmployees;
    },
  });
}
