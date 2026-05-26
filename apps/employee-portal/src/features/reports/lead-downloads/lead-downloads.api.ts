import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  JourneyTypeOption,
  JourneyTypeRaw,
  LeadExportPayload,
  LoanTypeOption,
  ReportRequestRow,
} from "./lead-downloads.types";

// Endpoints — see craft-frontend/src/Components/helper/ApiEndPoint.js
const APPLICATION_REPORT_URL = "/alpha/v1/report/application";
const APPLICATION_REQUEST_URL = "/alpha/v1/report";
const LOAN_TYPE_USER_URL = "/alpha/v1/user/loan-type";
const JOURNEY_TYPE_GROUP_URL = "/alpha/v1/master/journey-type/group";

interface ApiDataEnvelope<T> {
  status?: number | boolean;
  data?: T;
  message?: string;
}

// GET /alpha/v1/report → request-list table. Legacy stores response.data.data.
export function useApplicationRequestList() {
  return useQuery({
    queryKey: ["lead-downloads", "request-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ReportRequestRow[]> => {
      const body = await api.get<unknown, ApiDataEnvelope<ApiDataEnvelope<ReportRequestRow[]>>>(
        APPLICATION_REQUEST_URL
      );
      const inner = body?.data;
      return Array.isArray(inner?.data) ? (inner!.data as ReportRequestRow[]) : [];
    },
    refetchInterval: 15_000,
  });
}

// GET /alpha/v1/user/loan-type?status=1
export function useLoanTypeUser() {
  return useQuery({
    queryKey: ["lead-downloads", "loan-types"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, ApiDataEnvelope<LoanTypeOption[]>>(
        `${LOAN_TYPE_USER_URL}?status=1`
      );
      return Array.isArray(body?.data) ? body!.data! : [];
    },
  });
}

// GET /alpha/v1/master/journey-type/group  → { data: { [loanCode]: JourneyTypeRaw[] } }
// Legacy filters by workflow_type === "LEAD_CREATION" client-side.
export function useJourneyTypeGroup(loanCode?: string) {
  return useQuery({
    queryKey: ["lead-downloads", "journey-types", loanCode ?? ""],
    enabled: !!loanCode,
    queryFn: async (): Promise<JourneyTypeOption[]> => {
      const body = await api.get<unknown, ApiDataEnvelope<Record<string, JourneyTypeRaw[]>>>(
        JOURNEY_TYPE_GROUP_URL
      );
      const all = body?.data ?? {};
      if (!loanCode) return [];
      const list = all[loanCode] ?? [];
      return list
        .filter((j) => j.workflow_type === "LEAD_CREATION")
        .map((j) => ({ value: j.code, label: j.name }));
    },
  });
}

// POST /alpha/v1/report/application — submit an export request.
export function useSubmitLeadExport() {
  return useMutation({
    mutationFn: async (
      payload: LeadExportPayload
    ): Promise<ApiDataEnvelope<unknown>> => {
      return api.post<unknown, ApiDataEnvelope<unknown>>(
        APPLICATION_REPORT_URL,
        payload
      );
    },
  });
}
