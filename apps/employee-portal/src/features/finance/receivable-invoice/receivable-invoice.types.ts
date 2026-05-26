// Legacy craft-frontend/src/pages/PayableReceivableMgmt/Invoice/LenderInvoice.js
//   GET /alpha/v1/master/lender      (LENDER_GET)        -> { data: { result: LenderMaster[] } }
//   GET /alpha/v1/master/loan-type   (LOAN_TYPE_MASTER)  -> { data: { data: LoanTypeMaster[] } }
//
// The legacy table is rendered with `data={[]}` and every column accessor is empty —
// there is NO verified list endpoint. Row interface below documents the column set;
// rows array is empty until the list endpoint is added (see receivable-invoice.api.ts).

export interface LenderMaster {
  lender_id: string | number;
  name: string;
}

export interface LoanTypeMaster {
  id: string | number;
  name: string;
}

export interface LenderMasterResponse {
  data?: {
    result?: LenderMaster[];
  };
}

export interface LoanTypeMasterResponse {
  data?: {
    data?: LoanTypeMaster[];
  };
}

// Legacy filter values — matches invoiceFormik.initialValues verbatim.
export interface ReceivableInvoiceFilters {
  lender_id: string;
  loan_type_id: string;
  month: string;
}

// Field names below are placeholders — the legacy file does NOT expose any
// list-endpoint response shape (all accessors are empty React fragments).
// Once the list endpoint is verified, this shape should be updated from the
// real API response, not guessed.
export interface ReceivableInvoiceRow {
  channel_id?: string | number;
  channel_name?: string;
  loan_type?: string;
  month?: string;
  invoice_no?: string;
  invoice_date?: string;
  net_amount?: number | string;
  tax_amount?: number | string;
  state?: string;
  status?: string | number;
  // legacy used `lead_sync_at` inside the Channel Name accessor
  lead_sync_at?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
