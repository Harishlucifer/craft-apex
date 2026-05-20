// Exact shape from legacy craft-frontend/src/pages/Application/TrackingQ.js
// GET /alpha/v1/application/tracking?status=1|2|3&page=N

export interface TrackingParticipant {
  channel_name?: string;
  user_name?: string;
  user_type?: string;
  user_role_name?: string;
}

export interface TrackingQRow {
  application_id?: string;
  application_code?: string;
  application_name?: string;
  mobile?: string;
  loan_type_name?: string;
  lender?: { lender_name?: string };
  approved_details?: { offer_type?: string; offer_amount?: number | string };
  disbursed_details?: { offer_type?: string; offer_amount?: number | string };
  participant_details?: {
    CREATED_BY?: TrackingParticipant;
    SOURCED_BY?: TrackingParticipant;
    PROCESSED_BY?: TrackingParticipant;
  };
  lender_login_date?: string;
}

export interface TrackingQResponse {
  data: TrackingQRow[] | null;
  pagination: { total: number } | null;
}
