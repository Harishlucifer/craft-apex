// Legacy craft-frontend/src/pages/PayoutPlan/PayoutListView.js
// GET /alpha/v1/finance/payout-plan/list/?payout_user_type=CHANNEL|EMPLOYEE&payout_category=X
//   -> { data: PayoutPlanRow[] }

export interface PayoutPlanRow {
  payout_plan_id?: string | number;
  code?: string;
  name?: string;
  description?: string;
  territory?: { name?: string } | string;
  territory_name?: string;
  is_standard?: boolean | string;
  createdAt?: string;
  updatedAt?: string;
  status?: number;
}
