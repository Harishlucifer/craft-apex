// Legacy craft-frontend/src/pages/Lms/ActiveAccounts/index.js
// GET /alpha/v1/loan-account/list -> { data: ActiveAccountRow[] }

export interface ActiveAccountRow {
  loan_account_no?: string;
  borrower_name?: string;
  loan_type_code?: string;
  loan_amount?: number | string;
  disbursed_amount?: number | string;
  emi?: number | string;
  disbursed_date?: string;
  updated_date?: string;
  status?: number;
}
