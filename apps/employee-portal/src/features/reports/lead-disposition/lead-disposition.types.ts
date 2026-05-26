// Exact shapes from legacy craft-frontend/src/pages/MIS/LeadDisposition/LeadDisposition.js
// + DailySalesReport/DispositionDetails.js (column accessors).
//
// Four endpoints feed this page; see *.api.ts for URLs. Duplicated from
// sibling reports per the co-located, no-shared rule.

export type Id = string | number;

export interface EmployeeOption {
  user_id: Id;
  name: string;
}

export interface TerritoryOption {
  id: Id;
  name: string;
}

export interface DispositionRow {
  username?: string;
  loan_code?: string;
  lead_code?: string;
  lead_name?: string;
  activity_type?: string;
  outcome?: string;
  loan_status?: string;
  feedback?: string;
  created_at?: string;
  address?: string;
  remark?: string;
}

export interface SalesDashboard {
  [outcomeKey: string]: number | string | undefined;
}

export interface LeadDispositionFilter {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  territoryId?: string;
  userId?: string;
}

export interface ApiDataResponse<T> {
  data: T | null;
}
