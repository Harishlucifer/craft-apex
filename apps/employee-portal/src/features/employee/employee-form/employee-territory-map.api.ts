import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmployeeDetail, EmployeeSavePayload } from "./employee-form.types";
import type {
  LenderRow,
  LoanTypeRow,
  TerritoryLoanMapEntry,
  TerritoryRow,
  TerritoryTypeRow,
} from "./employee-territory-map.types";

// Endpoints verbatim from craft-frontend/src/pages/Configuration/Employee/EmployeeLocation.js.
const TERRITORY_TYPE_URL = "/alpha/v1/master/territory-type";
const TERRITORY_URL = "/alpha/v1/master/territory";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";
const EMPLOYEE_URL = "/alpha/v1/employee";

export function useTerritoryTypeMaster() {
  return useQuery({
    queryKey: ["master", "territory-type"],
    queryFn: async (): Promise<TerritoryTypeRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryTypeRow[]) : [];
    },
  });
}

export function useTerritoryMaster() {
  return useQuery({
    queryKey: ["master", "territory"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}

export function useLoanTypeMaster() {
  return useQuery({
    queryKey: ["master", "loan-type"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

// Legacy: GET /alpha/v1/master/lender?loan_type_id=A|B|C
// Response uses `result` (NOT `data`). When no loan types are picked, legacy
// passes `loan_type_id=0`.
export function useLenderMaster(loanTypeIds: (string | number)[]) {
  const joined = loanTypeIds.length ? loanTypeIds.join("|") : "0";
  return useQuery({
    queryKey: ["master", "lender", joined],
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(
        `${LENDER_URL}?loan_type_id=${joined}`
      );
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}

export function useEmployeeTerritoryLoanMap(id: string | undefined) {
  return useQuery({
    queryKey: ["employee-detail", id ?? "", "territory_loan_map"],
    enabled: Boolean(id),
    queryFn: async (): Promise<{
      detail: EmployeeDetail | null;
      map: TerritoryLoanMapEntry[];
    }> => {
      const body = await api.get<unknown, any>(
        `${EMPLOYEE_URL}/${encodeURIComponent(id!)}`
      );
      const r = (body?.result ?? body?.data ?? body) as EmployeeDetail | null;
      const map = Array.isArray(r?.territory_loan_map)
        ? ((r?.territory_loan_map ?? []) as TerritoryLoanMapEntry[])
        : [];
      return { detail: r ?? null, map };
    },
  });
}

// Mirrors craft-frontend index.js activeStep===2: POST the full employee
// bundle, overwriting only `territory_loan_map`. We strip ancillary `loan_types`
// /`lenders` labels per legacy (only ids + flags are persisted).
export interface SaveTerritoryMapArgs {
  detail: EmployeeDetail | null;
  fallbackEmployeeId: string;
  entries: TerritoryLoanMapEntry[];
}

export function useSaveEmployeeTerritoryMap() {
  return useMutation({
    mutationFn: async ({
      detail,
      fallbackEmployeeId,
      entries,
    }: SaveTerritoryMapArgs) => {
      const slimMap = entries.map((v) => ({
        territory_type_id: v.territory_type_id,
        territory_id: v.territory_id,
        status: v.status,
        all_lender_enabled: v.all_lender_enabled,
        loan_type_ids: v.loan_type_ids,
        lender_ids: v.lender_ids,
      }));

      const payload: EmployeeSavePayload = {
        ...(detail?.employee_id
          ? { employee_id: detail.employee_id }
          : { employee_id: fallbackEmployeeId }),
        ...(detail?.user_id ? { user_id: detail.user_id } : {}),
        employee_code: String(detail?.employee_code ?? ""),
        mobile: String(detail?.mobile ?? ""),
        email: String(detail?.email ?? ""),
        name: String(detail?.name ?? ""),
        designation: detail?.designation,
        hierarchy_level: detail?.hierarchy_level,
        user_role: {
          role_id: String(detail?.user_role?.role_id ?? ""),
        },
        ...(detail?.supervisor_user?.user_id
          ? { supervisor_user: { user_id: detail.supervisor_user.user_id } }
          : {}),
        ...(detail?.office_detail?.office_id
          ? { office_detail: { office_id: detail.office_detail.office_id } }
          : {}),
        status: Number(detail?.status ?? 1),
        territory_loan_map: slimMap,
        user_allocation: detail?.user_allocation,
        user_address: detail?.user_address,
        data: detail?.data,
      };
      return api.post<unknown, any>(EMPLOYEE_URL, payload);
    },
  });
}
