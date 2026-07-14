// Legacy: channel-flexi/src/pages/Verification/VerificationList.js     (mode="self")
//         channel-flexi/src/pages/Verification/VerificationTaskList.js (mode="search")
// GET /alpha/v1/verification/list?status={s}&{filters}&page=N&self=true
// GET /alpha/v1/verification/search?{filters}&page=N
// Body: { status, pagination: { page, size, total }, result: TaskRow[] }
// (alpha-api/app/controllers/v1/verification/controller.go List/Search)

export type TaskListMode = "self" | "search";

export interface TaskParticipant {
  user_name?: string;
  territory_name?: string;
  parent_territory_name?: string;
  created_at?: string;
}

export interface TaskRow {
  /** json-bigint id — string end-to-end. */
  verification_id?: string;
  verification_code?: string;
  verification_type?: string;
  verification_status?: string;
  status?: number;
  application_code?: string;
  loan_code?: string;
  external_lead_id?: string;
  name?: string;
  address?: string;
  loan_amount?: number | string;
  remarks?: string;
  created_at?: string;
  closed_date?: string;
  assigned_date?: string;
  turn_around_time?: number;
  created_by?: TaskParticipant | null;
  assigned_to?: TaskParticipant | null;
  submitted_to?: TaskParticipant | null;
}

export interface TaskListBody {
  result?: TaskRow[] | null;
  data?: TaskRow[] | null;
  pagination?: { total?: number } | null;
}

export interface TaskListResult {
  data: TaskRow[];
  total: number;
}

export interface TaskFilters {
  keyword?: string;
  territory?: string;
  from_date?: string;
  to_date?: string;
}

export interface TaskListParams {
  mode: TaskListMode;
  page: number;
  /** Pipe-joined status codes derived from permissions; omitted when `all`. */
  status?: string;
  filters: TaskFilters;
}

/**
 * VerificationList.js:83-86 — the status code each permission flag unlocks.
 * `allowed_permission.all` means "no status filter at all".
 */
export const TASK_STATUS_BY_PERMISSION: ReadonlyArray<
  readonly [permission: string, code: string]
> = [
  ["pending", "1"],
  ["pendingForApproval", "2"],
  ["completed", "3"],
  ["rejected", "-1"],
];
