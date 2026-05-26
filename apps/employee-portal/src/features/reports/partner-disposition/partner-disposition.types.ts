// Exact shapes from legacy craft-frontend/src/pages/MIS/PartnerDisposition/
// PartnerDispositionReport.js + DispositionDetails.js (Partner variant).
//
// Single endpoint `/alpha/v1/report/partner-disposition` called twice:
//   1) no `scope`        → body.data.sales + body.summary (cards)
//   2) `scope=PARTNER_FLOW` → body.data = DispositionRow[]

export type Id = string | number;

export interface EmployeeOption {
  user_id: Id;
  name: string;
}

export interface TerritoryOption {
  id: Id;
  name: string;
}

// Partner variant — note `dsa_code` and `partner_name` (different from lead's
// loan_code/lead_code and lead_name).
export interface PartnerDispositionRow {
  username?: string;
  dsa_code?: string;
  partner_name?: string;
  activity_type?: string;
  outcome?: string;
  feedback?: string;
  created_at?: string;
  address?: string;
  remark?: string;
}

export interface PartnerSummary {
  [outcomeKey: string]: number | string | undefined;
}

export interface PartnerDispositionFilter {
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  territoryId?: string;
  userId?: string;
}

export interface ApiDataResponse<T> {
  data: T | null;
}
