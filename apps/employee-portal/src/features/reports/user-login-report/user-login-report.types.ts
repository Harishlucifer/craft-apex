// Legacy craft-frontend/src/pages/Reports/UserLoginReport/index.js
// GET /alpha/v1/report/user-login-report?<filters>&page=N
//   -> { result: UserLoginRow[]; pagination: { total } }

export interface UserLoginRow {
  user_id?: string | number;
  territory_code?: string;
  territory_name?: string;
  parent_territory_name?: string;
  email?: string;
  username?: string;
  employee_code?: string;
  status?: number | string;
  mobile?: string;
  role_name?: string;
  user_type?: string;
  platform?: string;
  login_at?: string;
  logout_at?: string;
}

export interface UserLoginReportResponse {
  result: UserLoginRow[] | null;
  pagination: { total: number } | null;
}
