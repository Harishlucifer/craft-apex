// GET /alpha/v1/application?page=N
//   -> { status, data: ApplicationRow[] | null, pagination: { total } | null }
//
// Backend: app/routes/v1.go:189 `applicationRoute.Get("/", losController.List)`.
// Row shape: app/handler/los/application_list.go `ApplicationListObject`.
//
// This is the SAME endpoint the employee portal's fulfillment-list calls. It is
// auto-scoped server-side: app/services/db/application.go:113 restricts
// UserTypeCustomer to applications where the caller is an
// `application_participant`. So there is no customer id to pass — we just ask
// for the list and get our own rows back.

/** app/handler/common/common.go:68 TaskResponse */
export interface ActiveTask {
  task_name?: string;
  task_id?: string;
  stage_name?: string;
  stage_id?: string;
  status?: string;
  pending_with?: string;
  assigned_at?: string;
}

export interface ApplicationRow {
  /** json-bigint: stays a string end-to-end. */
  application_id?: string;
  code?: string;
  name?: string;
  loan_type_name?: string;
  loan_type_code?: string;
  purpose_of_loan?: string;
  loan_amount?: number | string;
  /** Numeric lifecycle status (int8 server-side). */
  status?: number;
  /** Human-ish status string, e.g. "LOGIN_PENDING". */
  loan_status?: string;
  application_status?: string;
  active_task?: ActiveTask | null;
  createdAt?: string;
}

export interface ApplicationListResponse {
  data?: ApplicationRow[] | null;
  /** Not sent by this endpoint, but kept for the standard defensive unwrap. */
  result?: ApplicationRow[] | null;
  pagination?: { total: number } | null;
}

export interface ApplicationListResult {
  rows: ApplicationRow[];
  total: number;
}
