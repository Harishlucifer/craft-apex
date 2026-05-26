import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChecklistDetail,
  ChecklistRow,
  LoanTypeOption,
  UserInfo,
} from "./doc-checklist-share.types";

// Legacy ApiEndPoint.js:
//   USER_INFO              = /alpha/v1/user/info
//   LOAN_TYPE_USER         = /alpha/v1/user/loan-type
//   GET_DOCUMENT_CHECKLIST = /alpha/v1/master/checklist
const USER_INFO_URL = "/alpha/v1/user/info";
const LOAN_TYPE_USER_URL = "/alpha/v1/user/loan-type";
const DOCUMENT_CHECKLIST_URL = "/alpha/v1/master/checklist";

interface ApiDataResponse<T> {
  data: T | null;
}
interface ApiResultResponse<T> {
  result: T | null;
}

export function useUserInfo() {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async (): Promise<UserInfo | null> => {
      const body = await api.get<unknown, ApiDataResponse<UserInfo>>(USER_INFO_URL);
      return body?.data ?? null;
    },
  });
}

export function useLoanTypeUser() {
  return useQuery({
    queryKey: ["loan-type-user", "status=1"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, ApiDataResponse<LoanTypeOption[]>>(
        `${LOAN_TYPE_USER_URL}?status=1`
      );
      return body?.data ?? [];
    },
  });
}

export function useChecklists(loanTypeId: string | null) {
  return useQuery({
    queryKey: ["doc-checklist-list", loanTypeId ?? ""],
    enabled: loanTypeId != null && loanTypeId !== "",
    queryFn: async (): Promise<ChecklistRow[]> => {
      // Legacy emits the trailing `/` before `?loanType=` — preserve verbatim.
      const body = await api.get<unknown, ApiResultResponse<ChecklistRow[]>>(
        `${DOCUMENT_CHECKLIST_URL}/?loanType=${encodeURIComponent(loanTypeId!)}`
      );
      const arr = body?.result ?? [];
      // Legacy sorts by sequence ascending.
      return [...arr].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    },
  });
}

export function useChecklistDetail(checklistId: string | null) {
  return useQuery({
    queryKey: ["doc-checklist-detail", checklistId ?? ""],
    enabled: checklistId != null && checklistId !== "",
    queryFn: async () => {
      const body = await api.get<unknown, ApiResultResponse<ChecklistDetail>>(
        `${DOCUMENT_CHECKLIST_URL}/${encodeURIComponent(checklistId!)}`
      );
      const groups = body?.result?.checklist_group ?? [];
      return [...groups].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    },
  });
}
