// Legacy: craft-frontend/src/Components/PayableReceivableManagement/InVoice/Invoice.js
// Wrapped by: craft-frontend/src/pages/PayableReceivableMgmt/Invoice/index.js
//   <InvoiceComponent moduleName="EMPLOYEE_INVOICE" />
// PAYABLE branch driven by location.pathname.includes("payable")
//
// List endpoint (legacy APIENDPOINTS.GET_INVOICE_LIST):
//   GET /alpha/v1/finance/invoice?category={module.configuration.category}
//   GET /alpha/v1/finance/invoice?category=…&channelId=…&mode=PAYABLE
//                                &territory_id=…&month=…
// Body shape (GetCall returns response.data directly; we get the same body):
//   { data: { data: InvoiceRow[] } }   (legacy reads res.data.data)
//
// Field names below are verbatim from the legacy column accessors in Invoice.js.

export interface InvoiceTaxDetails {
  sgst?: number | string;
  cgst?: number | string;
  igst?: number | string;
  sgst_amount?: number | string;
  cgst_amount?: number | string;
  igst_amount?: number | string;
}

export interface InvoiceCoreChannel {
  name?: string;
}

export interface InvoiceCoreEmployee {
  name?: string;
}

export interface InvoiceRow {
  // Identity
  id?: string | number;
  invoiceNo?: string;
  // Who (Partner branch only — coreEmployeeList is for EMPLOYEE_INCENTIVE)
  coreChannelList?: InvoiceCoreChannel;
  coreEmployeeList?: InvoiceCoreEmployee;
  // Volumes / amounts
  noOfLeads?: number | string;
  netAmount?: number | string;
  totalAmount?: number | string;
  // Taxes
  taxDetails?: InvoiceTaxDetails;
  // Status (matches legacy inVoiceStatus constant — 1..5)
  status?: number;
}

export interface InvoiceListPayload {
  data?: InvoiceRow[];
}

export interface InvoiceListResponse {
  data?: InvoiceListPayload;
}

// Lookups for the verified filter bar (Territory Type / Territory / Channel / Month).
//   GET /alpha/v1/master/territory               -> { data: { data: TerritoryMaster[] } }
//   GET /alpha/v1/master/territory/user          -> { data: { data: { territory_type, territory } } }
//   GET /alpha/v1/channel?territory_id=…         -> { data: { data: ChannelOptionRow[] } }
export interface TerritoryMaster {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}

export interface TerritoryTypeItem {
  id: string | number;
  name: string;
}

export interface TerritoryUserResponse {
  data?: {
    data?: {
      territory_type?: TerritoryTypeItem[];
      territory?: TerritoryTypeItem[];
    };
  };
}

export interface TerritoryMasterResponse {
  data?: {
    data?: TerritoryMaster[];
  };
}

export interface ChannelOptionRow {
  channel_id: string | number;
  name?: string;
}

export interface ChannelListResponse {
  data?: {
    data?: ChannelOptionRow[];
  };
}

export interface InvoiceFilters {
  territory_type_id: string;
  territory_id: string;
  channel_id: string;
  month: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Legacy constants/constant.js → inVoiceStatus (verbatim, value→key).
export const INVOICE_STATUS: Record<number, string> = {
  1: "Initiated",
  2: "Business Team Approved",
  3: "Finance Team Reviewed",
  4: "Partner Accepted",
  5: "Finance Team Approved",
};
