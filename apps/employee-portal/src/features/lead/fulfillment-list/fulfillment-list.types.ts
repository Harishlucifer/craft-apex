// Legacy craft-frontend/src/Components/Lead/FullFillmentList.js
// GET /alpha/v1/application?page=N[&journey_type=X][&exclude_journey_type=Y]
//   -> { data: ApplicationRow[]; pagination: { total } }

export interface ApplicationRow {
  id?: string | number | bigint;
  application_id?: string | number | bigint;
  code?: string;
  application_code?: string;
  name?: string;
  application_name?: string;
  mobile?: string;
  loan_type_name?: string;
  loan_amount?: number | string;
  application_status?: string;
  territory_name?: string;
  participant_details?: {
    SOURCED_BY?: { user_name?: string; channel_name?: string };
    CREATED_BY?: { user_name?: string; channel_name?: string };
    PROCESSED_BY?: { user_name?: string };
  };
  createdAt?: string;
}

export interface FulfillmentListResponse {
  data: ApplicationRow[] | null;
  pagination: { total: number } | null;
}
