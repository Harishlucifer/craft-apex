// Exact shapes from legacy craft-frontend/src/pages/DocumentChecklist/ChecklistShare.js.

export type Id = string | number;

// GET /alpha/v1/user/info -> body.data
export interface UserInfo {
  user_type?: "EMPLOYEE" | "CHANNEL" | string;
  username?: string;
  designation?: string;
  office_name?: string;
  mobile?: string;
  user_role_code?: string;
  partner_category?: string;
}

// GET /alpha/v1/user/loan-type?status=1 -> body.data[]
export interface LoanTypeOption {
  id?: Id;
  loan_type_id?: Id;
  name?: string;
  configuration?: { logo?: string } | null;
  status?: number;
}

// GET /alpha/v1/master/checklist/?loanType=ID -> body.result[]
export interface ChecklistRow {
  checklist_id: Id;
  title?: string;
  sequence?: number;
  status?: number; // legacy filters === 1
  loan_type?: { loan_type_name?: string };
  applicable_to?: string;
}

// GET /alpha/v1/master/checklist/{id} -> body.result.checklist_group[]
export interface ChecklistDocument {
  document_name?: string;
}

export interface ChecklistItem {
  checklist_item_id?: Id;
  document?: ChecklistDocument;
}

export interface ChecklistGroup {
  sequence?: number;
  checklist_item_name?: string;
  items?: ChecklistItem[];
}

export interface ChecklistDetail {
  checklist_group?: ChecklistGroup[];
}
