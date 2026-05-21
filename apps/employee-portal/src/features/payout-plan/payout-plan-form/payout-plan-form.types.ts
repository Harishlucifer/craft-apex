// Legacy craft-frontend/src/pages/PayoutPlan/{AddPayoutPlan,PayoutPlanDetails,SchemeMapping}.js
// POST /alpha/v1/finance/payout-plan                       -> save plan
// GET  /alpha/v1/finance/payout-plan/{payout_plan_id}     -> { result: Detail }
// Schemes:        GET /alpha/v1/finance/scheme?published=1&mode=payable|receivable
// Lookups:        /alpha/v1/lookup?group_code=PARTNER_CATEGORY,PAYOUT_USER_TYPE,PARTNER_TYPE,PAYOUT_SCOPE,PAYOUT_INTERVAL,PAYABLE
// Loan types:     /alpha/v1/master/loan-type
// Lenders:        /alpha/v1/master/lender
// Territory:      /alpha/v1/master/territory + /alpha/v1/master/territory-type
// Employee roles: /alpha/v1/master/user-role

export const PAYOUT_PARTNER_TYPE = {
  SOURCING: "SOURCING",
  SERVICING: "SERVICING",
} as const;

export const USER_TYPE = {
  PARTNER: "PARTNER",
  CHANNEL: "CHANNEL",
  EMPLOYEE: "EMPLOYEE",
  VENDOR: "VENDOR",
  TERRITORY: "TERRITORY",
  CUSTOMER: "CUSTOMER",
} as const;

export interface PayoutPlanDetail {
  payout_plan_id?: string | number;
  name?: string;
  description?: string;
  partner_category?: string;
  user_type?: string;
  user_role_id?: string | number | null;
  partner_type?: string;
  scope?: string;
  territory_id?: string | number | null;
  payout_interval?: string;
  payout_cutoff_day?: string | number;
  payout_category?: string;
  scheme_id?: Array<{ id: string | number }>;
  is_standard_plan?: number;
  status?: number;
}

export interface PayoutPlanSavePayload {
  payout_plan_id?: string | number;
  name: string;
  description?: string;
  partner_category?: string;
  user_type: string;
  partner_type?: string;
  user_role_id?: string | number | null;
  territory_id?: string | number | null;
  payout_interval?: string;
  payout_cutoff_day?: string | number;
  payout_category?: string;
  scheme_id: Array<{ id: string | number }>;
  is_standard_plan: number;
  status: number;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface TerritoryRow {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}

export interface TerritoryTypeRow {
  territory_type_id: string | number;
  territory_type_name: string;
}

export interface EmployeeRoleRow {
  id: string | number;
  name: string;
}

export interface SchemeRow {
  id: string | number;
  code?: string;
  name?: string;
  lenderId?: string | number;
  loanTypeId?: string | number;
  mode?: string;
  startDate?: string;
  endDate?: string;
  computationRange?: string;
  isRecurring?: boolean;
  isAddon?: boolean;
  payoutAppliesOn?: string;
  isPublished?: boolean;
  status?: number;
}

export interface LenderOption {
  lender_id: string | number;
  name: string;
}

export interface LoanTypeOption {
  id: string | number;
  name: string;
}
