// Legacy: craft-frontend/src/Components/PayableReceivableManagement/InVoice/IncentiveStatement.js
//   <InvoiceComponent moduleName="EMPLOYEE_INCENTIVE" />
// Underlying: craft-frontend/src/Components/PayableReceivableManagement/InVoice/Invoice.js
// Path-driven mode → location.pathname.includes("incentive") => estimateMode = "INCENTIVE".
//
// List endpoint (legacy APIENDPOINTS.GET_INVOICE_LIST):
//   GET /alpha/v1/finance/invoice?category={module.configuration.category}
//   Filtered (capSubBtnStatus):
//   GET /alpha/v1/finance/invoice?category=…&channelId=…&mode=INCENTIVE
//                                &territory_id=…&month=…
// Body shape (GetCall returns response.data directly): { data: { data: InvoiceRow[] } }
//
// Field names below are verbatim from legacy column accessors in Invoice.js.
// EMPLOYEE_INCENTIVE branch — Tax Percentage / Tax Amount columns are OMITTED in legacy.

export interface InvoiceCoreEmployee {
  name?: string;
}

export interface InvoiceCoreChannel {
  name?: string;
}

export interface IncentiveRow {
  // Identity
  id?: string | number;
  invoiceNo?: string;
  // Who (legacy reads coreEmployeeList.name first, falls back to coreChannelList.name)
  coreEmployeeList?: InvoiceCoreEmployee;
  coreChannelList?: InvoiceCoreChannel;
  // Volumes / amounts
  noOfLeads?: number | string;
  netAmount?: number | string;
  totalAmount?: number | string;
  // Status (matches legacy inVoiceStatus constant — 1..5)
  status?: number;
}

export interface IncentiveListPayload {
  data?: IncentiveRow[];
}

export interface IncentiveListResponse {
  data?: IncentiveListPayload;
}

// Lookups for the verified filter bar (Territory Type / Territory / Employee / Month).
//   GET /alpha/v1/master/territory       -> { data: { data: TerritoryMaster[] } }
//   GET /alpha/v1/master/territory/user  -> { data: { data: { territory_type, territory } } }
//   GET /alpha/v1/employee?territory_id=…-> { data: { data: EmployeeOptionRow[] } }
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

export interface EmployeeOptionRow {
  employee_id: string | number;
  name?: string;
}

export interface EmployeeListResponse {
  data?: {
    data?: EmployeeOptionRow[];
  };
}

export interface IncentiveFilters {
  territory_type_id: string;
  territory_id: string;
  employee_id: string;
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
