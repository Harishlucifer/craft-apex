// Legacy craft-frontend/src/pages/TargetMgmt/PlanListView.js
// GET /alpha/v1/master/target-plan -> { data: TargetPlanRow[] }

export interface TargetPlanRow {
  target_plan_id?: string | number;
  name?: string;
  description?: string;
  user_type?: string;
  user_role?: { name?: string };
  partner_category?: string;
  start_period?: string;
  end_period?: string;
  status?: number;
}
