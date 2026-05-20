// Exact shape from legacy craft-frontend/src/pages/Application/RejectedQ.js
// GET /alpha/v1/application/tracking?status=-1|-3&page=N

export interface RejectedParticipant {
  channel_name?: string;
  user_name?: string;
  user_type?: string;
  user_role_name?: string;
}

export interface RejectedQRow {
  application_id?: string;
  application_code?: string;
  application_name?: string;
  mobile?: string;
  loan_type_name?: string;
  lender?: { lender_name?: string };
  participant_details?: {
    CREATED_BY?: RejectedParticipant;
    SOURCED_BY?: RejectedParticipant;
    PROCESSED_BY?: RejectedParticipant;
  };
  lender_login_date?: string;
}

export interface RejectedQResponse {
  data: RejectedQRow[] | null;
  pagination: { total: number } | null;
}
