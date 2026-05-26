// Exact shapes from legacy craft-frontend/src/pages/Utility/Utilityreassign.js.
// IDs are returned by json-bigint so they may arrive as string or number.

export type Id = string | number;

// GET /alpha/v1/employee/territory-loantype -> body.result[]
export interface TerritoryLoanTypeRow {
  user_id: Id;
  territory_id: Id;
  role_id: Id;
  loanType_id: Id;
  name: string;
  territory: string;
  loanType: string;
}

export interface TerritoryLoanTypeResponse {
  result: TerritoryLoanTypeRow[] | null;
}

// GET /alpha/v1/application?... -> body
export interface ReassignLeadRow {
  application_id: Id;
  code?: string;
  loan_type_name?: string;
  loan_amount?: number | string;
  name?: string;
  contact_name?: string;
  mobile?: string;
  territory_type?: string;
  territory_name?: string;
  type?: "FULL_FLEDGED_APPLICATION" | "SHORT_APPLICATION" | string;
  application_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReassignListResponse {
  data: ReassignLeadRow[] | null;
  pagination: { total: number } | null;
}

// POST /alpha/v1/application/lead-transfer
export interface LeadTransferPayload {
  from_user_id: string;
  to_user_id: string;
  application_ids: Id[];
}

export interface LeadTransferResponse {
  status: number;
  message?: string;
}

// UI option shape (mirrors legacy react-select { value, label })
export interface AssignOption {
  user_id: Id;
  territory_id: Id;
  role_id: Id;
  loanType_id: Id;
  label: string;
}
