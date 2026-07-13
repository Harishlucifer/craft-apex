/**
 * Legacy: channel-flexi/src/pages/Verification/VerificationList.js
 *           (getVerificationTaskList, line 154 — the self queue)
 *         channel-flexi/src/pages/Verification/VerificationTaskList.js
 *           (line 110 — the searchable all-tasks view)
 *
 * Replaces:
 *   GET /alpha/v1/verification/list?status={s}&{filters}&page=N&self=true
 *   GET /alpha/v1/verification/search?{filters}&page=N
 *
 * Backend: alpha-api/app/routes/v1.go:439-440 -> verification List / Search.
 */
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  TaskFilters,
  TaskListBody,
  TaskListParams,
  TaskListResult,
  TaskRow,
} from "./task-list.types";

const URL_VERIFICATION_LIST = "/alpha/v1/verification/list";
const URL_VERIFICATION_SEARCH = "/alpha/v1/verification/search";

function appendFilters(qs: URLSearchParams, filters: TaskFilters): void {
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.append(key, String(value));
    }
  }
}

function buildUrl(params: TaskListParams): string {
  const qs = new URLSearchParams();
  // Legacy always sends `status` on the self queue (possibly empty when the
  // module grants `all`); the search view never sends it.
  if (params.mode === "self") qs.set("status", params.status ?? "");
  appendFilters(qs, params.filters);
  qs.set("page", String(params.page));
  if (params.mode === "self") qs.set("self", "true");

  const base =
    params.mode === "self" ? URL_VERIFICATION_LIST : URL_VERIFICATION_SEARCH;
  return `${base}?${qs.toString()}`;
}

function unwrap(body: TaskListBody | null): TaskListResult {
  const arr = body?.result ?? body?.data ?? body;
  const rows: TaskRow[] = Array.isArray(arr) ? arr : [];
  return { data: rows, total: body?.pagination?.total ?? 0 };
}

export function useTaskList(params: TaskListParams) {
  return useQuery({
    queryKey: ["task-list", params],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<TaskListResult> =>
      unwrap(await api.get<unknown, TaskListBody>(buildUrl(params))),
  });
}
