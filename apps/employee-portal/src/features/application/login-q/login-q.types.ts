// Exact shape from legacy craft-frontend/src/pages/Application/LoginQ.js
// GET /alpha/v1/application?login_q=true&page=N  (+ optional flat filters)

export interface LoginQRow {
  code?: string;
  loan_code?: string;
  loan_type_name?: string;
  loan_amount?: number | string;
  name?: string;
  mobile?: string;
  external_journey_type?: string;
  external_lead_type?: string;
  loan_status?: string;
  application_status?: string;
  createdAt?: string;
  sourced_by?: {
    channel_name?: string;
    user_name?: string;
    user_role?: string;
    user_type?: string;
  };
  active_task?: { task_name?: string };
  processed_by?: { user_name?: string };
}

export interface LoginQResponse {
  data: LoginQRow[] | null;
  pagination: { total: number } | null;
}
