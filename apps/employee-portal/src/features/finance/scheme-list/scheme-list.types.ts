// Legacy craft-frontend/src/pages/PayableReceivableMgmt/SchemeListView.js
// GET /alpha/v1/finance/scheme?category=PAYABLE|RECEIVABLE|INCENTIVE
//   -> { status: boolean; data: SchemeRow[] }

export interface SchemeRow {
  scheme_id?: string | number;
  code?: string;
  name?: string;
  lender_name?: string;
  loan_type?: { name?: string } | string;
  loan_type_name?: string;
  computation_type?: string;
  computation_range?: string;
  is_recurring?: boolean | string;
  scheme_type?: string;
  mode?: string;
  payout_event?: string;
  status?: number;
}

export interface SchemeListResponse {
  status?: boolean;
  data?: SchemeRow[];
}
