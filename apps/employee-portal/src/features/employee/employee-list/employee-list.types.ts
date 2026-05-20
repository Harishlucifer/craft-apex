// Legacy craft-frontend/src/pages/Configuration/Employee/EmployeeList.js
// GET /alpha/v2/master/employees?page=N -> { data: EmployeeRow[]; pagination: { total } }

export interface EmployeeRow {
  employee_id?: string | number | bigint;
  employee_code?: string;
  name?: string;
  email?: string;
  mobile?: string;
  status?: number;
  role?: { name?: string };
  supervisor_user?: { employee_code?: string; name?: string };
  office?: { name?: string } | string;
}

export interface EmployeeListResponse {
  data: EmployeeRow[] | null;
  pagination: { total: number } | null;
}
