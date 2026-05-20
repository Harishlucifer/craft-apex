// Exact shape from legacy craft-frontend/src/pages/Application/DisbursedQ.js
// GET /alpha/v1/application/tracking?status=4&page=N

export interface DisbursedParticipant {
  channel_name?: string;
  user_name?: string;
  user_type?: string;
  user_role_name?: string;
}

export interface DisbursedQRow {
  application_id?: string;
  application_code?: string;
  application_name?: string;
  mobile?: string;
  loan_type_name?: string;
  lender?: { lender_name?: string };
  approved_details?: { offer_type?: string; offer_amount?: number | string };
  disbursed_details?: { offer_type?: string; offer_amount?: number | string };
  participant_details?: {
    CREATED_BY?: DisbursedParticipant;
    SOURCED_BY?: DisbursedParticipant;
    PROCESSED_BY?: DisbursedParticipant;
  };
  lender_login_date?: string;
}

export interface DisbursedQResponse {
  data: DisbursedQRow[] | null;
  pagination: { total: number } | null;
}
