// Exact shapes from legacy craft-frontend/src/pages/MIS/AttendanceReport/.
// Five endpoints in this screen — see *.api.ts for URLs.

export type Id = string | number;

// GET /alpha/v1/master/user-role -> body.data[]
export interface UserRoleRow {
  id: Id;
  name: string;
  code: string;
  userType?: string;
}

// GET /alpha/v1/user/least/territory -> body.data[]
export interface BranchRow {
  id: Id;
  name: string;
}

// GET /alpha/v1/report/attendance -> body.data[]
// Field names taken verbatim from legacy column accessors (date, employee_name,
// employee_id, branch, punch_in, punch_out, working_hours, status, note, user_id).
export interface AttendanceRow {
  user_id: Id;
  date?: string;
  employee_name?: string;
  employee_id?: string;
  branch?: string;
  punch_in?: string;
  punch_out?: string;
  working_hours?: string;
  status?: string;
  note?: string;
}

// POST /alpha/v1/report/attendance-summary -> body.data[]
export interface AttendanceSummaryRow {
  employee_name?: string;
  month?: string;
  total_present?: number | string;
  late_logins?: number | string;
  total_absent?: number | string;
  total_working_hours?: number | string;
}

export interface AttendanceFilter {
  date?: string;        // YYYY-MM-DD
  role_id?: string;     // user-role.id
  territoryId?: string; // attendance list uses `territoryId`
}

export interface AttendanceSummaryPayload {
  start_date: string;
  end_date: string;
  role_id?: string;
  territory_id?: string; // summary endpoint uses `territory_id` (legacy)
}

export interface AttendanceRevertPayload {
  user_id: Id;
  punch_type: "PUNCH_OUT";
}

export interface AttendanceRevertResponse {
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[] | null;
}
