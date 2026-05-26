// Legacy:
//   craft-frontend/src/Components/PayableReceivableManagement/Estimate/Estimate.js
//   moduleName = "PARTNER", URL path includes "receivable" -> estimateMode = "RECAIVABLE"
//
// Endpoints (resolved verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js):
//   GET_ESTIMATE      = /alpha/v1/finance/estimate
//   LENDER_GET        = /alpha/v1/master/lender              -> body.data.result[]
//   LOAN_TYPE_MASTER  = /alpha/v1/master/loan-type           -> body.data.data[]
//   TERRITORY_MASTER  = /alpha/v1/master/territory           -> body.data.data[]
//   TERRITORY_USER    = /alpha/v1/master/territory/user      -> body.data.data.{territory,territory_type}[]
//
// GET_ESTIMATE query string built by legacy fetchEstimateList():
//   ?mode=PAYABLE&category=<module.category>&[user_type=&associate_id=]&territory_id=&month=
//
//   NOTE — legacy bug-or-feature preserved verbatim: even in RECEIVABLE mode,
//   the legacy code passes `mode=PAYABLE` (hard-coded `let mode = "PAYABLE"`).
//   The `category` comes from `module.configuration.category` which in legacy
//   wiring is "RECEIVABLE" for the Receivable page. Lender/loan-type filters
//   are collected by the form but NOT appended to the request URL in legacy.

// ---------- Estimate row (table data) ----------
export interface EstimateRow {
  partner_name?: string;
  employee_name?: string;
  lead_code?: string;
  lender_name?: string;
  loan_type?: string;
  scheme_name?: string;
  disbursement_date?: string;
  application_name?: string;
  over_due_amount?: number | string;
  disbursement_amount?: number | string;
  payout_rate?: number | string;
  payout_amount?: number | string;
}

export interface EstimateSummary {
  TotalEarnings?: number | string;
  LeadsCount?: number | string;
}

export interface EstimateResponse {
  data?: EstimateRow[];
  summary?: EstimateSummary;
}

// ---------- Lookup option ----------
export interface LookupOption {
  value: string;
  label: string;
}

// ---------- Lookup raw rows (response.data shape) ----------
export interface LenderMasterRow {
  lender_id: number | string;
  name: string;
}
export interface LenderMasterResponse {
  result?: LenderMasterRow[];
}

export interface LoanTypeMasterRow {
  id: number | string;
  name: string;
}
export interface LoanTypeMasterResponse {
  data?: LoanTypeMasterRow[];
}

export interface TerritoryMasterRow {
  territory_id: number | string;
  territory_name: string;
  territory_type_id: number | string;
}

export interface TerritoryTypeRow {
  id: number | string;
  name: string;
}

export interface TerritoryUserResponse {
  data?: {
    territory?: TerritoryTypeRow[];
    territory_type?: TerritoryTypeRow[];
  };
}

// ---------- Filters (RECEIVABLE mode) ----------
// Mirrors the legacy formik values for estimateMode === "RECEIVABLE":
//   { territoryType, territoryTypeName, territory_id, lender_id, loan_type_id, month }
export interface ReceivableEstimateFilters {
  lender_id: string;
  loan_type_id: string;
  territoryType: string;
  territory_id: string;
  month: string;
}
