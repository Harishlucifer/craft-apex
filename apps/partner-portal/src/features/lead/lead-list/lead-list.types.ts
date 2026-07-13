// Legacy: channel-flexi/src/Components/Lead/LeadList.js   -> GET /alpha/v1/application
//         channel-flexi/src/Components/Lead/LeadListV2.js -> GET /alpha/v2/application
// The two legacy files are ~1600-line near-identical copies; the only material
// differences are the API version and the v2 response normalizer. One component
// here, parameterized by `apiVersion`.

export type LeadApiVersion = "v1" | "v2";

/**
 * Legacy `listName` prop (LeadList.js:456) — mapped to the `status` query param.
 * channel-flexi's routes never pass it (only /lead/list and /lead/list-v2 exist),
 * so status normally comes from `module.configuration.status`.
 */
export type LeadListName = "FULFILLED" | "ARCHIVED" | "DEDUPE_Q";

/**
 * Flat filter keys the legacy filter panel (LeadListFilter.js) appends to the
 * query string verbatim. Backend reads these in
 * alpha-api/app/controllers/v1/los/controller.go List().
 */
export interface LeadFilters {
  date_type?: string;
  start_date?: string;
  end_date?: string;
  source_type?: string;
  territory?: string;
  loan_type?: string;
  mobile_no?: string;
  keyword?: string;
}

export interface LeadSourcedBy {
  user_name?: string;
  user_role?: string;
  user_type?: string;
  channel_name?: string;
  supervisor_username?: string;
  /** v1 sends this; v2 sends `employee_code` — normalize() fills it in. */
  user_associate_id?: string;
  employee_code?: string;
}

export interface LeadActiveTask {
  task_name?: string;
  stage_name?: string;
  user_detail?: { username?: string; user_type?: string };
}

export interface LeadRow {
  /** json-bigint: application ids exceed 2^53 — string end-to-end. */
  id?: string;
  code?: string;
  external_lead_id?: string;
  external_lead_type?: string;
  loan_type_name?: string;
  loan_amount?: number | string;
  name?: string;
  contact_name?: string;
  mobile?: string;
  status?: number;
  loan_status?: string;
  application_status?: string;
  territory_name?: string;
  /** v2 sends `origin_platform` — normalize() maps it to this camelCase key. */
  originPlatform?: string;
  createdAt?: string;
  updatedAt?: string;
  sourced_by?: LeadSourcedBy;
  active_task?: LeadActiveTask;
  pending_ask_count?: number;
  resolved_ask_count?: number;
}

/** Raw body as it comes off the wire (both versions). */
export interface LeadListBody {
  data?: LeadRow[] | null;
  result?: LeadRow[] | null;
  pagination?: { total?: number } | null;
  application_status?: Record<string, string> | null;
}

/** Normalized shape the page consumes. */
export interface LeadListResult {
  data: LeadRow[];
  pagination: { total: number };
  applicationStatus: Record<string, string>;
}

export interface LeadListParams {
  version: LeadApiVersion;
  page: number;
  /** Resolved from listName, else module.configuration.status. */
  status?: string;
  /** module.configuration.include_journey_types */
  journeyType?: string;
  /** module.configuration.exclude_journey_types */
  excludeJourneyType?: string;
  filters: LeadFilters;
}
