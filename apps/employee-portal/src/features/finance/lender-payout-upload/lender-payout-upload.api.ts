import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LenderLoanTypeRow,
  LenderMasterRow,
  PayoutDumpFilter,
  PayoutDumpRow,
  UploadPayoutDumpInput,
} from "./lender-payout-upload.types";

// Endpoints verbatim from craft-frontend ApiEndPoint.js.
const PAYOUT_DUMP_LIST_URL = "/alpha/v1/finance/payout-dump";
const UPLOAD_PAYOUT_DUMP_URL = "/alpha/v1/finance/payout-dump/upload";
const LENDER_GET_URL = "/alpha/v1/master/lender";

// Legacy GetCall(url) resolves to the response body directly; the axios
// instance here returns response.data via its response interceptor, so
// `api.get(url)` gives us the same body shape the legacy code reads from
// `res?.data?.…`.

export function usePayoutDumpList(filter: PayoutDumpFilter) {
  const qs: string[] = [];
  if (filter.lender_id) qs.push(`lender_id=${encodeURIComponent(filter.lender_id)}`);
  if (filter.loan_type_id)
    qs.push(`loan_type_id=${encodeURIComponent(filter.loan_type_id)}`);
  if (filter.month) qs.push(`month=${encodeURIComponent(filter.month)}`);
  const url = qs.length ? `${PAYOUT_DUMP_LIST_URL}?${qs.join("&")}` : PAYOUT_DUMP_LIST_URL;

  return useQuery({
    queryKey: [
      "payout-dump-list",
      filter.lender_id ?? "",
      filter.loan_type_id ?? "",
      filter.month ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PayoutDumpRow[]> => {
      // Legacy: setDumpList(res?.data?.data)
      const body = await api.get<unknown, any>(url);
      const arr = body?.data?.data ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as PayoutDumpRow[]) : [];
    },
  });
}

export function useLenderOptions() {
  return useQuery({
    queryKey: ["lender-master"],
    queryFn: async (): Promise<LenderMasterRow[]> => {
      // Legacy: res?.data?.result
      const body = await api.get<unknown, any>(LENDER_GET_URL);
      const arr = body?.data?.result ?? body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as LenderMasterRow[]) : [];
    },
  });
}

export function useLenderLoanTypes(lenderId: string | undefined) {
  return useQuery({
    queryKey: ["lender-loan-types", String(lenderId ?? "")],
    enabled: Boolean(lenderId),
    queryFn: async (): Promise<LenderLoanTypeRow[]> => {
      // Legacy: GET LENDER_GET + `/${id}` -> res?.data?.result?.lender_loan_type
      const body = await api.get<unknown, any>(
        `${LENDER_GET_URL}/${encodeURIComponent(String(lenderId))}`
      );
      const lender = body?.data?.result ?? body?.result ?? body?.data ?? body;
      const list = Array.isArray(lender?.lender_loan_type)
        ? (lender.lender_loan_type as LenderLoanTypeRow[])
        : [];
      return list;
    },
  });
}

export function useUploadPayoutDump() {
  return useMutation({
    mutationFn: async (v: UploadPayoutDumpInput) => {
      // Multipart fields verbatim from legacy PayoutDumpUpload.js onSubmit:
      //   lender_id, template, loan_type_id, month
      const fd = new FormData();
      fd.append("lender_id", v.lender_id);
      fd.append("template", v.template);
      fd.append("loan_type_id", v.loan_type_id);
      fd.append("month", v.month);
      // The craft-apex api client (packages/api/src/client.ts) detects
      // FormData and passes it through without JSON-stringifying, and lets
      // the browser set the multipart Content-Type/boundary.
      return api.post<unknown, unknown>(UPLOAD_PAYOUT_DUMP_URL, fd);
    },
  });
}
