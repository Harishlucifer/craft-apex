// Exact shape from legacy craft-frontend/src/Components/Lead/DynamicLeadList.js
// GET /alpha/v2/application?page=N&exclude_journey_type=VERIFICATION
//   /lead/list/fulfilled -> &status=3 ; /lead/list/archived -> &status=-1

export type LeadListScope = "ALL" | "FULFILLED" | "ARCHIVED";

export interface LeadRow {
  id?: string;
  code?: string;
  external_lead_id?: string;
  territory_code?: string;
  territory_name?: string;
  parent_territory_name?: string;
  name?: string;
  sub_loan_type_name?: string;
  purpose_of_loan?: string;
  loan_amount?: number | string;
  external_journey_type?: string;
  application_status?: string;
  createdAt?: string;
  sourced_by?: { user_name?: string; user_associate_id?: string };
}

export interface LeadListResponse {
  data: LeadRow[] | null;
  pagination: { total: number } | null;
}
