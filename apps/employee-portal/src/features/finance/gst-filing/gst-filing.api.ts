import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  InvoiceGstUpdatePayload,
  InvoiceGstUpdateResponse,
  InvoiceRow,
} from "./gst-filing.types";

// Legacy APIENDPOINTS.GET_INVOICE_LIST + APIENDPOINTS.INVOICE_GST_UPDATE
const INVOICE_LIST_URL = "/alpha/v1/finance/invoice";
const INVOICE_GST_UPDATE_URL =
  "/alpha/v1/finance/invoice/invoice-status-update";

// Legacy: `${GET_INVOICE_LIST}?gst_settlement_mode=PAID_FULLY`
// Legacy reads `res.data.data` — the api client unwraps to response.data,
// so the rows live at `body.data`.
export function useGstFilingInvoiceList() {
  return useQuery({
    queryKey: ["gst-filing", "invoice-list", "PAID_FULLY"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<InvoiceRow[]> => {
      const body = await api.get<unknown, any>(
        `${INVOICE_LIST_URL}?gst_settlement_mode=PAID_FULLY`
      );
      const rows = body?.data;
      return Array.isArray(rows) ? (rows as InvoiceRow[]) : [];
    },
  });
}

export function useUpdateInvoiceGst() {
  return useMutation({
    mutationFn: async (
      payload: InvoiceGstUpdatePayload
    ): Promise<InvoiceGstUpdateResponse> =>
      api.post<unknown, InvoiceGstUpdateResponse>(
        INVOICE_GST_UPDATE_URL,
        payload
      ),
  });
}
