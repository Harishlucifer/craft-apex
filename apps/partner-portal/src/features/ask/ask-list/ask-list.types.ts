// Legacy: channel-flexi/src/Components/Common/AskList.js
// GET /alpha/v1/application/ask/list?page=N (+ flat filter keys)
// Body: { data: AskRow[] | null, pagination: { total }, dashboard: [...] }

/** AskList.js:333-349 — the four ask statuses the legacy table renders. */
export const ASK_STATUS_LABEL: Record<number, string> = {
  1: "In Progress",
  2: "Resolved",
  3: "Reopened",
  4: "Accepted",
};

export interface AskSourcedBy {
  user_name?: string;
  user_role?: string;
  user_type?: string;
  channel_name?: string;
  supervisor_username?: string;
}

export interface AskRow {
  /** json-bigint: application ids exceed 2^53 — string end-to-end. */
  applicationId?: string;
  ApplicationCode?: string;
  business_name?: string;
  loan_type?: string;
  territory_name?: string;
  askType?: string;
  /** Legacy renders `title` under the "Remarks" column. */
  title?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  sourced_by?: AskSourcedBy;
  raisedByUser?: { username?: string };
  lender_apply?: {
    lender_apply_id?: string;
    lender?: { lender_name?: string };
  };
}

export interface AskListBody {
  data?: AskRow[] | null;
  result?: AskRow[] | null;
  pagination?: { total?: number } | null;
}

export interface AskListResult {
  data: AskRow[];
  total: number;
}

export interface AskListParams {
  page: number;
  keyword?: string;
}
