// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/LoanType/LoanTypeList.js
// GET /alpha/v1/master/loan-type -> { data: LoanTypeRow[] }

export interface LoanTypeRow {
  id?: string | number | bigint;
  code?: string;
  name?: string;
  loan_category?: string;
  status?: number;
}
