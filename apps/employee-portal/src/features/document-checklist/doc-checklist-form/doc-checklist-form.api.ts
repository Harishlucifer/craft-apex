import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChecklistDetail,
  ChecklistSavePayload,
  DocumentClassRow,
  DocumentRow,
  LenderRow,
  LoanTypeRow,
  LookupItem,
  RuleRow,
  ServiceProviderRow,
} from "./doc-checklist-form.types";

const CHECKLIST_URL = "/alpha/v1/master/checklist";
const DOC_CLASS_URL = "/alpha/v1/master/document-class";
const DOC_URL = "/alpha/v1/master/document";
const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const LENDER_URL = "/alpha/v1/master/lender";
const RULE_URL = "/alpha/v1/rule";
const SERVICE_PROVIDER_URL =
  "/alpha/v1/master/service-provider?provider_type=OCR";
const LOOKUP_URL =
  "/alpha/v1/lookup?group_code=CHECKLIST_TYPE,CHECKLIST_ITEM_MANDATORY,APPLICANT_TYPE,CHECKLIST_TAGS";

export function useChecklistLookups() {
  return useQuery({
    queryKey: ["lookup", "checklist-bundle"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useDocClassOptions() {
  return useQuery({
    queryKey: ["doc-class-master"],
    queryFn: async (): Promise<DocumentClassRow[]> => {
      const body = await api.get<unknown, any>(DOC_CLASS_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as DocumentClassRow[]) : [];
    },
  });
}

export function useDocOptions() {
  return useQuery({
    queryKey: ["doc-master"],
    queryFn: async (): Promise<DocumentRow[]> => {
      const body = await api.get<unknown, any>(DOC_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as DocumentRow[]) : [];
    },
  });
}

export function useChecklistLoanTypes() {
  return useQuery({
    queryKey: ["loan-type-master-checklist"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeRow[]) : [];
    },
  });
}

export function useChecklistLenders() {
  return useQuery({
    queryKey: ["lender-master-checklist"],
    queryFn: async (): Promise<LenderRow[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderRow[]) : [];
    },
  });
}

export function useChecklistRules() {
  return useQuery({
    queryKey: ["rule-list-for-checklist"],
    queryFn: async (): Promise<RuleRow[]> => {
      const body = await api.get<unknown, any>(RULE_URL);
      const arr = body?.data ?? body?.result ?? body;
      const all = Array.isArray(arr) ? (arr as RuleRow[]) : [];
      // Legacy filter: type === "CHECKLIST_APPLICATION"
      return all.filter((r) => r.type === "CHECKLIST_APPLICATION");
    },
  });
}

export function useOcrServiceProviders() {
  return useQuery({
    queryKey: ["service-provider-ocr"],
    queryFn: async (): Promise<ServiceProviderRow[]> => {
      const body = await api.get<unknown, any>(SERVICE_PROVIDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as ServiceProviderRow[]) : [];
    },
  });
}

export function useChecklistDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["checklist-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<ChecklistDetail | null> => {
      const body = await api.get<unknown, any>(
        `${CHECKLIST_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as ChecklistDetail | null;
    },
  });
}

export function useSaveChecklist() {
  return useMutation({
    mutationFn: async (payload: ChecklistSavePayload) =>
      api.post<unknown, any>(CHECKLIST_URL, payload),
  });
}
