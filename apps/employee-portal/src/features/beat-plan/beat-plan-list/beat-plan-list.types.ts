// Legacy craft-frontend/src/pages/BeatPlan/BeatPlanView.js
// GET /alpha/v1/core/beat-list?page=N[&from_date=&to_date=&user_id=]
//   -> { data: BeatPlanRow[]; pagination: { total } }

export interface BeatPlanRow {
  beat_plan_id?: string | number;
  beat_date?: string;
  user_name?: string;
  employee_name?: string;
  start_time?: string;
  end_time?: string;
  total_distance?: number | string;
  planned_visits?: number;
  visits_completed?: number;
}

export interface BeatPlanListResponse {
  data: BeatPlanRow[] | null;
  pagination: { total: number } | null;
}
