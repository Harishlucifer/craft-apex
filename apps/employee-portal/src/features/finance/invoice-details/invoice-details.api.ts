import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  InvoiceDetail,
  InvoiceDetailResponse,
  PartnerInfo,
  PartnerInfoResponse,
} from "./invoice-details.types";

// Legacy endpoints — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
//   GET_INVOICE_LIST:    /alpha/v1/finance/invoice
//   PARTNER_DATA_FETCH:  /alpha/v1/partner/:channelId
const URL_INVOICE = "/alpha/v1/finance/invoice";
const URL_PARTNER = "/alpha/v1/partner";

// Legacy invoiceWorkFlow.js (getInvoiceList):
//   const res = await GetCall(`${APIENDPOINTS.GET_INVOICE_LIST}/${invoice_id}`)
//   setInvoiceData(res?.data?.result)
export function useInvoiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice-details.detail", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<InvoiceDetail | undefined> => {
      const body = await api.get<unknown, InvoiceDetailResponse>(
        `${URL_INVOICE}/${id}`,
      );
      return body?.data?.result;
    },
  });
}

// Legacy invoiceWorkFlow.js (getChannelData):
//   const res = await GetCall(APIENDPOINTS.PARTNER_DATA_FETCH.replace(":channelId", channelId))
//   setChannelInfo(res?.data?.result)
export function usePartnerInfo(channelId: string | number | undefined) {
  return useQuery({
    queryKey: ["invoice-details.partner", channelId],
    enabled: Boolean(channelId),
    queryFn: async (): Promise<PartnerInfo | undefined> => {
      const body = await api.get<unknown, PartnerInfoResponse>(
        `${URL_PARTNER}/${channelId}`,
      );
      return body?.data?.result;
    },
  });
}

// DEFERRED: list-fetch for `/finance/invoice-details/` (no id).
// The legacy route mounts the SAME workflow component (`InvoiceProcessingCreate`
// -> `InvoiceWorkFlow`) for both `/` and `/:id`. With no id the component runs
// the workflow builder in "create" mode by POST-ing /alpha/v1/workflow/build
// with `{ workflow_type: "INVOICE_FLOW" }` and then renders an MUI Stepper of
// dynamically-loaded step components. There is no legacy list endpoint to map
// from. Per the no-guessing rule, the list-mode workflow is deferred.

// DEFERRED: workflow execution (POST /alpha/v1/workflow/execution),
// step submit (POST /alpha/v1/finance/invoice), Ask modal, Adjustments,
// Invoice PDF (InvoicePdf.js) — see legacy invoiceWorkFlow.js. These are
// complex workflows / modals and are explicitly out of scope for this port.
