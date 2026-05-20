// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/Lender Scheme/SchemeList.js
// GET /alpha/v1/master/lender/schemes -> { data: LenderSchemeRow[] }

export interface LenderSchemeRow {
  scheme_id?: string | number;
  code?: string;
  name?: string;
  lender_name?: string;
  loan_type?: { name?: string } | string;
  status?: number;
}
