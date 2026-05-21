import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderLoanTypeRow,
  LenderOption,
  LookupItem,
  TemplateLinkResult,
} from "./lender-pincode-form.types";

const LENDER_URL = "/alpha/v1/master/lender";
const LOOKUP_URL = "/alpha/v1/lookup?group_code=LENDER_PINCODE_OPTION";
const TEMPLATE_URL = "/alpha/v1/migration/download";
const PINCODE_SAVE_URL = "/alpha/v1/master/lender/pincode";

export function useLenderOptions() {
  return useQuery({
    queryKey: ["lender-master"],
    queryFn: async (): Promise<LenderOption[]> => {
      const body = await api.get<unknown, any>(LENDER_URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderOption[]) : [];
    },
  });
}

export function useLenderLoanTypes(lenderId: string | number | undefined) {
  return useQuery({
    queryKey: ["lender-loan-types", String(lenderId ?? "")],
    enabled: Boolean(lenderId),
    queryFn: async (): Promise<LenderLoanTypeRow[]> => {
      const body = await api.get<unknown, any>(
        `${LENDER_URL}/${encodeURIComponent(String(lenderId))}`
      );
      const lender = body?.result ?? body?.data ?? body;
      const list: LenderLoanTypeRow[] = Array.isArray(
        lender?.lender_loan_type
      )
        ? lender.lender_loan_type
        : [];
      // Legacy: only status===1, deduped by loan_type_id.
      const active = list.filter((l) => l.status === 1);
      const seen = new Set<string>();
      const unique: LenderLoanTypeRow[] = [];
      for (const item of active) {
        const k = String(item.loan_type_id);
        if (!seen.has(k)) {
          seen.add(k);
          unique.push(item);
        }
      }
      return unique;
    },
  });
}

export function useConfigurationMethods() {
  return useQuery({
    queryKey: ["lookup", "LENDER_PINCODE_OPTION"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useTemplateLink(templateType: string | undefined) {
  return useQuery({
    queryKey: ["pincode-template-link", templateType ?? ""],
    enabled: Boolean(templateType),
    queryFn: async (): Promise<TemplateLinkResult | null> => {
      const body = await api.get<unknown, any>(
        `${TEMPLATE_URL}/${encodeURIComponent(String(templateType))}`
      );
      const r = body?.result ?? body?.data ?? body;
      return r && typeof r.link === "string" ? (r as TemplateLinkResult) : null;
    },
  });
}

export interface SavePincodeInput {
  lender_id: string | number;
  lender_template_type: string;
  loan_type_id: string | number;
  template: File;
}

export function useSavePincodeUpload() {
  return useMutation({
    mutationFn: async (v: SavePincodeInput) => {
      const fd = new FormData();
      fd.append("lender_id", String(v.lender_id));
      fd.append("lender_template_type", v.lender_template_type);
      fd.append("loan_type_id", String(v.loan_type_id));
      fd.append("template", v.template);
      return api.post<unknown, unknown>(PINCODE_SAVE_URL, fd);
    },
  });
}
