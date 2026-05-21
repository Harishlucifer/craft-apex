// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/Lender Scheme/SchemeAdd.js
//
// Legacy is a giant tabbed form with 7 sub-builders (fees, subvention,
// downpayment, emi-holiday, collateral, repayment-modes, appropriation) plus
// product amortization. We port the header attributes here and expose every
// sub-array + the `configuration` blob as JSON textareas so the schema
// round-trips. Future iterations can replace each JSON pane with a structured
// sub-form (the legacy sub-form files are 200-460 lines each).
//
// POST /alpha/v1/master/lender/scheme              -> save (LENDER_SCHEME)
// GET  /alpha/v1/master/lender/scheme/{id}         -> { result: SchemeDetail }   (LENDER_SCHEME_FETCH)
// Lookups: CONTRACT_TYPE
// Loan types:  /alpha/v1/master/loan-type
// Lenders:     /alpha/v1/master/lender

export interface LenderSchemeDetail {
  lender_scheme_id?: string | number;
  code?: string;
  name?: string;
  loan_type_id?: string | number;
  sub_loan_type_id?: string | number;
  lender_id?: string | number;
  emi_date?: number;
  cutoff_date?: number;
  min_loan_amount?: number;
  max_loan_amount?: number;
  min_tenure?: number;
  max_tenure?: number;
  min_rate_of_interest?: number;
  max_rate_of_interest?: number;
  interest_type?: string;
  tenure_type?: string;
  repayment_frequency?: string;
  terms_and_condition?: string;
  configuration?: unknown;
  sequence?: number;
  status?: number;
  fees_and_charges?: unknown[];
  subvention?: unknown[];
  downpayment?: unknown[];
  emi_holiday?: unknown[];
  collateral?: unknown[];
  repayment_modes?: unknown[];
  appropriations?: unknown[];
}

export interface LenderSchemeSavePayload {
  lender_scheme_id?: string | number;
  code: string;
  name: string;
  loan_type_id: string | number;
  sub_loan_type_id?: string | number;
  lender_id: string | number;
  emi_date?: number;
  cutoff_date?: number;
  min_loan_amount?: number;
  max_loan_amount?: number;
  min_tenure?: number;
  max_tenure?: number;
  min_rate_of_interest?: number;
  max_rate_of_interest?: number;
  interest_type?: string;
  tenure_type?: string;
  repayment_frequency?: string;
  terms_and_condition?: string;
  repayment_day_choice?: null;
  configuration: unknown;
  sequence?: number;
  status: number;
  fees_and_charges?: unknown[] | null;
  subvention?: unknown[] | null;
  downpayment?: unknown[] | null;
  emi_holiday?: unknown[] | null;
  collateral?: unknown[] | null;
  repayment_modes?: unknown[] | null;
  appropriations?: unknown[] | null;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LenderRow {
  lender_id: string | number;
  name: string;
}
