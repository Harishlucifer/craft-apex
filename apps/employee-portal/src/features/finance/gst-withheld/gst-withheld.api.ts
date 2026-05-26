import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  GstWithheldReleasePayload,
  GstWithheldRow,
  GstWithheldUpdateEnvelope,
} from "./gst-withheld.types";

// Legacy: APIENDPOINTS.GET_INVOICE_LIST    = /alpha/v1/finance/invoice
//         APIENDPOINTS.INVOICE_GST_UPDATE  = /alpha/v1/finance/invoice/invoice-status-update
const URL_LIST = "/alpha/v1/finance/invoice";
const URL_UPDATE = "/alpha/v1/finance/invoice/invoice-status-update";

const SETTLEMENT_MODE = "PAYMENT_WITHOUT_GST" as const;

/**
 * Legacy getInvoiceList:
 *   GetCall(`${GET_INVOICE_LIST}?gst_settlement_mode=PAYMENT_WITHOUT_GST`)
 *   then setInvoiceData(res?.data?.data)
 * Our axios interceptor already unwraps `response.data`, so the legacy
 * `res.data.data` becomes `body.data`.
 */
export function useGstWithheldList() {
  const url = `${URL_LIST}?gst_settlement_mode=${SETTLEMENT_MODE}`;
  return useQuery({
    queryKey: ["gst-withheld-list"],
    queryFn: async (): Promise<GstWithheldRow[]> => {
      const body = await api.get<unknown, { data?: GstWithheldRow[] }>(url);
      return Array.isArray(body?.data) ? body.data : [];
    },
  });
}

/**
 * Legacy updateInvoiceGST:
 *   PostCall(INVOICE_GST_UPDATE, {
 *     data: reverseList,             // [{id}]
 *     gst_settlement_mode: "PAYMENT_WITHOUT_GST",
 *   })
 *   success when response?.status truthy.
 */
export function useReleaseGstWithheld() {
  return useMutation({
    mutationFn: async (
      ids: string[]
    ): Promise<GstWithheldUpdateEnvelope> => {
      const payload: GstWithheldReleasePayload = {
        data: ids.map((id) => ({ id })),
        gst_settlement_mode: SETTLEMENT_MODE,
      };
      const body = await api.post<unknown, GstWithheldUpdateEnvelope>(
        URL_UPDATE,
        payload
      );
      return body;
    },
  });
}
