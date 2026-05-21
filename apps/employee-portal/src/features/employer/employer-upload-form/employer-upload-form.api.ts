import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderLoanTypeRow,
  LenderOption,
} from "./employer-upload-form.types";

const LENDER_URL = "/alpha/v1/master/lender";
const UPLOAD_URL = "/alpha/v1/employer/lender/upload";

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

export interface SaveEmployerUploadInput {
  lender_id: string | number;
  loan_type: string | number;
  document: File;
}

export function useSaveEmployerUpload() {
  return useMutation({
    mutationFn: async (v: SaveEmployerUploadInput) => {
      const fd = new FormData();
      fd.append("lender_id", String(v.lender_id));
      fd.append("loan_type", String(v.loan_type));
      fd.append("document", v.document);
      return api.post<unknown, unknown>(UPLOAD_URL, fd);
    },
  });
}
