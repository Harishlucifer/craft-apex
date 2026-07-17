// Subset of the backend EmployeeParams (alpha-api handler/user/employee.go)
// returned by GET /alpha/v1/employee/:employeeId and /alpha/v1/employee/.

export interface EmployeeRole {
  map_id?: string;
  role_id?: string;
  role_name?: string;
  role_code?: string;
}

export interface EmployeeOffice {
  office_id?: string;
  office_name?: string;
}

export interface EmployeeSupervisor {
  username?: string;
  mobile?: string;
  user_role?: string;
  user_role_name?: string;
  user_id?: string;
  employee_id?: string;
  employee_code?: string;
}

export interface EmployeeDetail {
  employee_id?: string;
  employee_code?: string;
  mobile?: string;
  email?: string;
  name?: string;
  designation?: string;
  profile_image?: string;
  hierarchy_level?: string;
  office_detail?: EmployeeOffice | null;
  supervisor_user?: EmployeeSupervisor | null;
  user_role?: EmployeeRole | null;
}
