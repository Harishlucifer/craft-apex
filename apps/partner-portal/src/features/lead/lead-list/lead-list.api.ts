/**
 * Legacy: channel-flexi/src/Components/Lead/LeadList.js   (getLeadList / exportLeadList)
 *         channel-flexi/src/Components/Lead/LeadListV2.js (getLeadList + normalizeLeadListPayload)
 *
 * Replaces:
 *   GET /alpha/v1/application?page=N&{status,journey_type,exclude_journey_type,...filters}
 *   GET /alpha/v2/application?page=N&{...}                        (same contract, v2 field names)
 *   GET /alpha/{v1|v2}/application?download=true&{...filters}     (export — legacy exportLeadList)
 *
 * Backend: alpha-api/app/controllers/v1/los/controller.go List() — reads
 * page, size, status, journey_type, exclude_journey_type, date_type, start_date,
 * end_date, source_type, territory, loan_type, mobile_no, keyword, download.
 */
import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LeadFilters,
  LeadListBody,
  LeadListName,
  LeadListParams,
  LeadListResult,
  LeadRow,
  LeadApiVersion,
} from "./lead-list.types";

const URL_APPLICATION_V1 = "/alpha/v1/application";
const URL_APPLICATION_V2 = "/alpha/v2/application";

/** LeadList.js:456-459 — the legacy `listName` -> status mapping. */
export const LEAD_STATUS_BY_LIST_NAME: Record<LeadListName, string> = {
  FULFILLED: "3",
  ARCHIVED: "-1",
  DEDUPE_Q: "-2",
};

function basePath(version: LeadApiVersion): string {
  return version === "v2" ? URL_APPLICATION_V2 : URL_APPLICATION_V1;
}

function appendFilters(qs: URLSearchParams, filters: LeadFilters): void {
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.append(key, String(value));
    }
  }
}

function buildUrl(params: LeadListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.status) qs.set("status", params.status);
  if (params.journeyType) qs.set("journey_type", params.journeyType);
  if (params.excludeJourneyType) {
    qs.set("exclude_journey_type", params.excludeJourneyType);
  }
  appendFilters(qs, params.filters);
  return `${basePath(params.version)}?${qs.toString()}`;
}

/** exportLeadList (LeadList.js:1264) — same filters, no paging, download=true. */
function buildExportUrl(version: LeadApiVersion, filters: LeadFilters): string {
  const qs = new URLSearchParams({ download: "true" });
  appendFilters(qs, filters);
  return `${basePath(version)}?${qs.toString()}`;
}

/**
 * LeadListV2.js:53-78 (normalizeLeadListItem / normalizeLeadListPayload).
 * v2 sends `origin_platform` and `sourced_by.employee_code`; v1 sends
 * `originPlatform` and `sourced_by.user_associate_id`. Level the two.
 */
function normalize(body: LeadListBody | LeadRow[] | null): LeadListResult {
  const raw = body as LeadListBody | null;
  const unwrapped = Array.isArray(body)
    ? body
    : (raw?.data ?? raw?.result ?? body);
  const rows: LeadRow[] = Array.isArray(unwrapped) ? unwrapped : [];

  return {
    data: rows.map((item) => {
      const sourcedBy = item.sourced_by ?? {};
      return {
        ...item,
        originPlatform:
          item.originPlatform ??
          (item as { origin_platform?: string }).origin_platform ??
          "",
        sourced_by: {
          ...sourcedBy,
          user_associate_id:
            sourcedBy.user_associate_id ?? sourcedBy.employee_code ?? "",
        },
      };
    }),
    pagination: {
      total: Array.isArray(body) ? rows.length : (raw?.pagination?.total ?? 0),
    },
    applicationStatus: Array.isArray(body)
      ? {}
      : (raw?.application_status ?? {}),
  };
}

export function useLeadList(params: LeadListParams) {
  return useQuery({
    queryKey: ["lead-list", params],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LeadListResult> =>
      normalize(await api.get<unknown, LeadListBody>(buildUrl(params))),
  });
}

/** CSV column set mirrors the legacy `xlsxData` header row (LeadList.js:1298). */
const EXPORT_COLUMNS: ReadonlyArray<[string, (r: LeadRow) => string]> = [
  ["Lead ID", (r) => r.code ?? ""],
  ["Loan Type", (r) => r.loan_type_name ?? ""],
  ["Application Name", (r) => r.name ?? ""],
  ["Contact Person", (r) => r.contact_name ?? ""],
  ["Mobile Number", (r) => r.mobile ?? ""],
  ["Loan Amount", (r) => String(r.loan_amount ?? "")],
  ["Sourced By", (r) => r.sourced_by?.user_name ?? ""],
  ["User Type", (r) => r.sourced_by?.user_type ?? ""],
  ["Lead Type", (r) => r.external_lead_type ?? ""],
  ["Pending With", (r) => r.active_task?.user_detail?.username ?? ""],
  ["Active Step", (r) => r.active_task?.task_name ?? ""],
  ["Active Stage", (r) => r.active_task?.stage_name ?? ""],
  ["Status", (r) => r.application_status ?? r.loan_status ?? ""],
  ["Ask Pending", (r) => String(r.pending_ask_count ?? "")],
  ["Ask Resolved", (r) => String(r.resolved_ask_count ?? "")],
  ["Created At", (r) => r.createdAt ?? ""],
  ["Updated At", (r) => r.updatedAt ?? ""],
];

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(rows: LeadRow[]): string {
  const lines = [EXPORT_COLUMNS.map(([header]) => csvCell(header)).join(",")];
  for (const row of rows) {
    lines.push(EXPORT_COLUMNS.map(([, get]) => csvCell(get(row))).join(","));
  }
  return lines.join("\r\n");
}

/**
 * Legacy hits `?download=true`, gets the full (un-paginated) JSON row set back
 * and builds the workbook client-side (ExportXLSXModal + the `xlsx` package).
 * We do the same but emit CSV — partner-portal carries no spreadsheet dep.
 * Note: the backend rejects a download with no filters ("Please apply a filter
 * to download"), so that error surfaces to the caller as-is.
 */
export function useLeadExport(version: LeadApiVersion) {
  return useMutation({
    mutationFn: async (filters: LeadFilters): Promise<number> => {
      const body = await api.get<unknown, LeadListBody>(
        buildExportUrl(version, filters),
      );
      const rows = normalize(body).data;
      if (rows.length === 0) return 0;

      const blob = new Blob([`﻿${toCsv(rows)}`], {
        type: "text/csv;charset=utf-8;",
      });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `lead-list-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(href);
      return rows.length;
    },
  });
}
