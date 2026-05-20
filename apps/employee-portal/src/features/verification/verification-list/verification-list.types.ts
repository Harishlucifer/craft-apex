// Legacy craft-frontend/src/pages/Verification/VerificationList.js
// + VerificationTaskList.js — both hit /alpha/v1/verification/list
//   `?self=true&page=N` for the verification queue (self-assigned)
//   `?page=N`           for the task list (all)
// Response body: { result: VerificationRow[]; pagination: { total } }

export interface VerificationRow {
  verification_code?: string;
  name?: string;
  verification_status?: string;
  created_by?: {
    territory_name?: string;
    parent_territory_name?: string;
    created_at?: string;
    user_name?: string;
  };
}

export interface VerificationListResponse {
  result: VerificationRow[] | null;
  pagination: { total: number } | null;
}
