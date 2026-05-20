// Legacy craft-frontend/src/pages/Configuration/EmployerMgmt/mcaList.js
// GET /alpha/v1/employer?page=N[&keyword=] -> { data: EmployerRow[]; pagination: { total } }

export interface EmployerRow {
  employer_id?: string | number;
  cin?: string;
  name?: string;
  roc?: string;
  company_status?: string;
}

export interface EmployerListResponse {
  data: EmployerRow[] | null;
  pagination: { total: number } | null;
}
