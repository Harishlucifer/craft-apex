// Legacy craft-frontend/src/pages/Builder/AddProject.js
// POST /alpha/v1/master/project
// GET  /alpha/v1/master/project              -> { data: ProjectRow[] }   (filtered locally by developer_id + status===1)
// Lookups: COMMERCIAL_PROPERTY_TYPE, RESIDENTIAL_PROPERTY_TYPE, AGRI_PROPERTY_TYPE
// Bank lookup: /alpha/v1/lookup/bank?bank_name=&limit=10

export interface ApprovedLenderRow {
  bank_id: string | number;
  bank_name: string;
  approval_date: string;
  approval_code: string;
  status: number;
}

export interface ProjectRow {
  id?: string | number;
  project_id?: string | number;
  developer_id?: string | number;
  apf_code?: string;
  name?: string;
  project_type?: string;
  no_of_phase?: number | string;
  no_of_tower?: number | string;
  no_of_units?: number | string;
  possession_date?: string;
  pincode?: string;
  pincode_id?: string | number;
  contact_name?: string;
  contact_mobile?: string;
  apf_status?: number;
  status?: number;
  data?: { other_detail?: string };
  approved_lenders?: ApprovedLenderRow[];
}

export interface ProjectSavePayload {
  id?: string | number;
  project_id?: string | number;
  developer_id: string | number;
  name: string;
  project_type: string;
  apf_code?: string;
  pincode: string;
  pincode_id: string;
  no_of_phase: string;
  no_of_tower: string;
  no_of_units: string;
  possession_date: string | null;
  contact_name: string;
  contact_mobile: string;
  apf_status: number;
  approved_by: string;
  status: number;
  data: { other_detail?: string };
  approved_lenders: ApprovedLenderRow[];
}

export interface ProjectTypeLookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface BankRow {
  id: string | number;
  bankName: string;
}
