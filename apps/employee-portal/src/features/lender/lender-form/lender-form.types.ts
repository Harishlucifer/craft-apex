// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/Lender/{index,AddLender}.js
// POST /alpha/v1/master/lender          -> { result: { lender_id } }
// GET  /alpha/v1/master/lender/{id}     -> { result: LenderDetail }
// Lookups: GST_TYPE, LENDER_TYPE

export interface LenderLoanTypeRow {
  loan_type_id?: string | number;
  loanType?: string;
  status_fetch_method?: string;
  payout_cycle_start_date?: string;
  payout_cycle_end_date?: string;
  payout_dump?: string | number;
  rm?: string | number;
  status: number;
}

export interface LenderContractRow {
  lender_contract_id?: string | number;
  loan_type_id?: string | number;
  loan_type_name?: string;
  contract_type?: string;
  apply_method?: string;
  apply_method_name?: string;
  status_fetch_method?: string;
  status_fetch_method_name?: string;
  payout_cycle_start_date?: string;
  payout_cycle_end_date?: string;
  payout_dump?: string | number;
  rm?: string;
  contact_name?: string;
  contact_mobile?: string;
  contact_email?: string;
  contact_address?: string;
  terms_and_condition?: string;
  link_type?: string;
  link?: string;
  pincode_rule?: unknown;
  configuration?: unknown;
  income_eligible?: unknown;
  status: number;
}

export interface LenderDetail {
  lender_id?: string | number;
  code?: string;
  name?: string;
  description?: string;
  sequence?: number | string;
  lender_type?: string;
  gst_type?: string;
  logo?: string;
  status?: number;
  lender_loan_type?: LenderLoanTypeRow[];
  lender_loan_contract?: LenderContractRow[];
}

export interface LenderSavePayload {
  lender_id?: string | number;
  code: string;
  name: string;
  description?: string;
  sequence: number;
  lender_type: string;
  gst_type: string;
  logo: string;
  status: number;
  lender_loan_type?: LenderLoanTypeRow[];
  lender_loan_contract?: LenderContractRow[];
}

export interface LoanTypeMasterOption {
  id: string | number;
  code: string;
  name: string;
}

// Legacy linkTypesData (constant.js).
export const LINK_TYPE_STATIC = "STATIC";

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}
