// Exact row shape used by legacy craft-frontend/src/pages/EnquiryMgmt/List.js
// column accessors. Endpoint: /alpha/v1/application?page=N&journey_type=…
//
// Note: only the LIST view (columns + pagination) is ported. Legacy's 1474-LOC
// page also includes Ask/Partner/Reopen/Summary/AppliedLenders/BankStatement/
// CreditBureau drawers, an employee-assign modal, activity stream, CSV export,
// and a CommonListFilter sidebar — all deferred until each is needed.

export type Id = string | number;

export interface SourcedBy {
  user_role?: string;
  user_name?: string;
  user_type?: string;
  supervisor_username?: string;
  channel_name?: string;
}

export interface ActiveTask {
  task_name?: string;
  user_detail?: { username?: string };
}

export interface EnquiryRow {
  application_id: Id;
  code?: string;
  loan_code?: string;
  loan_type_name?: string;
  loan_amount?: number | string;
  name?: string;
  contact_name?: string;
  mobile?: string;
  apply_capacity?: string; // "ENTITY" | "INDIVIDUAL" — legacy `ApplicantCategory.Entity`
  sourced_by?: SourcedBy | null;
  type?: string; // journey type code
  external_journey_type?: string;
  external_lead_id?: string;
  external_lead_type?: string;
  active_task?: ActiveTask | null;
  status?: number | string;
  application_status?: string;
  loan_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationListResponse {
  data: EnquiryRow[] | null;
  pagination: { total: number } | null;
}

// Legacy `ENQUIRY_APPLICATION` is the default `filteredJourneyType` passed
// from <EnquiryListView/> via withModule wrapper.
export const ENQUIRY_JOURNEY_TYPE = "ENQUIRY_APPLICATION";
