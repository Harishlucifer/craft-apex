// Legacy craft-frontend/src/Components/Common/AskList.js
// GET /alpha/v1/application/ask/list?page=N -> { data: AskRow[]; pagination: { total } }

export interface AskRow {
  ask_id?: string | number;
  application_code?: string;
  /** Lead Details composite — use what's available */
  name?: string;
  mobile?: string;
  loan_type_name?: string;
  type_of_ask?: string;
  ask_name?: string;
  remarks?: string;
  raised_by?: { user_name?: string };
  status?: string | number;
  raised_at?: string;
  createdAt?: string;
}

export interface AskListResponse {
  data: AskRow[] | null;
  pagination: { total: number } | null;
}
