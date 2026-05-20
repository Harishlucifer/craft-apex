// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/Lender/LenderList.js
// GET /alpha/v1/master/lender -> { result: LenderRow[] }

export interface LenderRow {
  id?: string | number | bigint;
  code?: string;
  name?: string;
  lender_type?: string;
  status?: number;
}
