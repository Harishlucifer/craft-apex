// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/LoanType/{index,AddLoanType}.js
// POST /alpha/v1/master/loan-type            -> { result: { loan_type_id } }
// GET  /alpha/v1/master/loan-type/{id}       -> { result: LoanTypeDetail }
// Lookups: LOAN_CATEGORY, APPLY_CAPACITY, EMPLOYMENT_TYPE

export interface SubLoanRow {
  sub_loan_type_id?: string | number;
  loan_type_id?: string | number;
  sub_loan_type_code?: string;
  sub_loan: string;
  description?: string;
  sequence: number;
  facility_code: string;
  status: number;
}

export interface LoanTypeDetail {
  loan_type_id?: string | number;
  loan_code?: string;
  loan?: string;
  description?: string;
  loan_category?: string;
  sequence?: number | string;
  apply_capacity?: string[];
  employment_type?: string[];
  configuration?: unknown;
  status?: number;
  sub_loans?: SubLoanRow[];
}

export interface LoanTypeSavePayload {
  loan_type_id?: string | number;
  loan_code: string;
  loan_category: string;
  loan: string;
  description?: string;
  sequence: number;
  apply_capacity: string[];
  employment_type: string[];
  configuration: unknown;
  status: number;
  sub_loans: SubLoanRow[];
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}
