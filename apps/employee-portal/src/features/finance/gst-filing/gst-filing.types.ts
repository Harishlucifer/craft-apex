// Legacy /Components/PayableReceivableManagement/InVoice/VendorGSTFiling.js
// Endpoints (verified in /Components/helper/ApiEndPoint.js):
//   GET  /alpha/v1/finance/invoice?gst_settlement_mode=PAID_FULLY
//        → body.data  (legacy reads res.data.data because GetCall returns the
//          full axios response; the new api client unwraps to response.data).
//   POST /alpha/v1/finance/invoice/invoice-status-update
//        payload: { data: FilingEntry[], gst_settlement_mode: "PAID_FULLY" }

export type VendorGstFilingStatus = "FILED" | "NOT_FILED";

export interface InvoiceTaxDetails {
  sgst?: number | string | null;
  cgst?: number | string | null;
  igst?: number | string | null;
  sgstAmount?: number | string | null;
  cgstAmount?: number | string | null;
  igstAmount?: number | string | null;
}

export interface CoreChannel {
  name?: string | null;
}

export interface InvoiceRow {
  id: number | string;
  gstNo?: string | null;
  invoiceNo?: string | null;
  coreChannelList?: CoreChannel | null;
  netAmount?: number | string | null;
  totalAmount?: number | string | null;
  taxDetails?: InvoiceTaxDetails | null;
  vendorGstFilingStatus?: VendorGstFilingStatus | string | null;
  vendorGstFilingDate?: string | null;
}

export interface FilingEntry {
  id: string;
  filing_status: VendorGstFilingStatus;
}

export interface InvoiceGstUpdatePayload {
  data: FilingEntry[];
  gst_settlement_mode: "PAID_FULLY";
}

export interface InvoiceGstUpdateResponse {
  status?: boolean;
  message?: string;
}
