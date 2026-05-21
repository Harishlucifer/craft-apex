import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  JourneyTypeDetail,
  JourneyTypeSavePayload,
  LoanTypeOption,
  LookupItem,
} from "./journey-master-form.types";

// Legacy: GetCall(`/alpha/v1/lookup?group_code=WORKFLOW_TYPE,PARTNER_CATEGORY,USER_TYPE,PARTNER_TYPE`)
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=WORKFLOW_TYPE,PARTNER_CATEGORY,USER_TYPE,PARTNER_TYPE";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const JOURNEY_URL = "/alpha/v1/master/journey-type";

export function useJourneyFormLookups() {
  return useQuery({
    queryKey: ["journey-form-lookups"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-options"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

export function useJourneyTypeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["journey-type-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<JourneyTypeDetail | null> => {
      const body = await api.get<unknown, any>(
        `${JOURNEY_URL}?id=${encodeURIComponent(id!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      const first = Array.isArray(arr) ? (arr[0] as JourneyTypeDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveJourneyType() {
  return useMutation({
    mutationFn: async (payload: JourneyTypeSavePayload) =>
      api.post<unknown, unknown>(JOURNEY_URL, payload),
  });
}
