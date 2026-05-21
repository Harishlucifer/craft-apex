// Legacy craft-frontend/src/pages/Configuration/Employee/{AddEmployee,index}.js
//
// Legacy is a 4-step wizard (Profile, Address, Territory/Loan Map, Allocation)
// with OTP email/mobile verification. We port Step 1 (Profile) plus an
// optional Address tab and preserve the deeper arrays from detail so saves
// keep the full record intact.
//
// POST /alpha/v1/employee          -> save (full bundle)
// GET  /alpha/v1/employee/{id}     -> { result: EmployeeDetail }
// Lookups: HIERARCHY
// Roles:     /alpha/v1/master/user-role             (filter userType==="EMPLOYEE")
// Employees: /alpha/v2/master/employees             (for "Reports To")
// Offices:   /alpha/v1/master/office

export interface EmployeeDetail {
  employee_id?: string | number;
  user_id?: string | number;
  employee_code?: string;
  name?: string;
  email?: string;
  mobile?: string;
  designation?: string;
  hierarchy_level?: string;
  status?: number;
  user_role?: { role_id?: string | number; name?: string };
  supervisor_user?: { user_id?: string | number; name?: string; employee_code?: string };
  office_detail?: { office_id?: string | number; name?: string };
  user_address?: unknown;
  user_allocation?: unknown[];
  territory_loan_map?: unknown[];
  data?: { email_hash_value?: string; mobile_hash_value?: string };
}

export interface EmployeeSavePayload {
  employee_id?: string | number;
  user_id?: string | number;
  employee_code: string;
  mobile: string;
  email: string;
  name: string;
  designation?: string;
  password?: string;
  hierarchy_level?: string;
  user_role: { role_id: string };
  supervisor_user?: { user_id: string | number };
  office_detail?: { office_id: string | number };
  status: number;
  user_allocation?: unknown[];
  territory_loan_map?: unknown[];
  user_address?: unknown;
  data?: { email_hash_value?: string; mobile_hash_value?: string };
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface RoleRow {
  id: string | number;
  name: string;
  userType?: string;
}

export interface EmployeeOption {
  user_id: string | number;
  name: string;
  employee_code?: string;
}

export interface OfficeRow {
  id: string | number;
  name?: string;
}
