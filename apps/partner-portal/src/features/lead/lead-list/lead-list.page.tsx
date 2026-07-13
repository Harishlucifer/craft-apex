import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
import { PermissionGate, useModule } from "@craft-apex/layout";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@craft-apex/shared";
import {
  LEAD_STATUS_BY_LIST_NAME,
  useLeadExport,
  useLeadList,
} from "./lead-list.api";
import type {
  LeadApiVersion,
  LeadFilters,
  LeadListName,
} from "./lead-list.types";

/**
 * Legacy channel-flexi/src/Components/Lead/LeadList.js (v1) and LeadListV2.js
 * (v2) — two ~1600-line near-identical copies. One component here; the only
 * material difference is the API version (and the v2 field normalizer, which
 * lives in lead-list.api.ts).
 *
 * Deferred (legacy modals not ported): lead re-assign (POST
 * /alpha/v1/application/:id/assign), raise/resolve Ask, activity stream,
 * reopen lead, bank parser / credit bureau panels, lender-apply dropdown,
 * and the tenant-configuration driven column variants (mobile masking,
 * territory column, Flexiloans sub-status).
 */

const PAGE_SIZE = 10; // legacy groupSize

/** constant.js:540 dateTypeFilter — the only two values the backend honours. */
const DATE_TYPE_OPTIONS = [
  { value: "created_date", label: "Created date" },
  { value: "updated_date", label: "Updated date" },
];

const selectClass =
  "h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-400";

const EMPTY_FILTERS: LeadFilters = {};

const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "—"
    : `₹ ${Number(v).toLocaleString("en-IN")}`;

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "—";

/** module.configuration values are typed `unknown` — coerce to a query value. */
function asParam(value: unknown): string | undefined {
  if (typeof value === "string" && value !== "") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export interface LeadListPageProps {
  apiVersion: LeadApiVersion;
  /**
   * Legacy `listName` prop. channel-flexi's routes never pass it (only
   * /lead/list and /lead/list-v2 exist), so status normally comes from
   * module.configuration.status — but the mapping is kept for parity.
   */
  listName?: LeadListName;
}

export default function LeadListPage({
  apiVersion,
  listName,
}: LeadListPageProps) {
  const module = useModule();
  const location = useLocation();

  // The dashboard navigates here with `location.state.filterData` (LeadList.js:122).
  const seededFilters =
    (location.state as { filterData?: LeadFilters } | null)?.filterData ??
    EMPTY_FILTERS;

  const [filters, setFilters] = useState<LeadFilters>(seededFilters);
  const [draft, setDraft] = useState<LeadFilters>(seededFilters);
  const [page, setPage] = useState(1);

  // Re-seed when the dashboard pushes a new filter into the same mounted route.
  useEffect(() => {
    const next = (location.state as { filterData?: LeadFilters } | null)
      ?.filterData;
    if (next) {
      setFilters(next);
      setDraft(next);
      setPage(1);
    }
  }, [location.state]);

  const config = module?.node.configuration ?? {};
  const status = listName
    ? LEAD_STATUS_BY_LIST_NAME[listName]
    : asParam(config["status"]);

  const { data, isFetching } = useLeadList({
    version: apiVersion,
    page,
    ...(status ? { status } : {}),
    ...(asParam(config["include_journey_types"])
      ? { journeyType: asParam(config["include_journey_types"]) }
      : {}),
    ...(asParam(config["exclude_journey_types"])
      ? { excludeJourneyType: asParam(config["exclude_journey_types"]) }
      : {}),
    filters,
  });

  const exportLeads = useLeadExport(apiVersion);

  const rows = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFilters = () => {
    setFilters(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleExport = () => {
    exportLeads.mutate(filters, {
      onSuccess: (count) => {
        if (count === 0) toast.error("Nothing to export for these filters");
        else toast.success(`Exported ${count} lead(s)`);
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to export leads",
        ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-9 w-56 pl-8"
                placeholder="Lead ID, name, mobile…"
                value={draft.keyword ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, keyword: e.target.value }))
                }
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">
              Date type
            </span>
            <select
              className={selectClass}
              value={draft.date_type ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, date_type: e.target.value }))
              }
            >
              <option value="">Select date type</option>
              {DATE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">From</span>
            <Input
              type="date"
              className="h-9 w-40"
              value={draft.start_date ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, start_date: e.target.value }))
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">To</span>
            <Input
              type="date"
              className="h-9 w-40"
              value={draft.end_date ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, end_date: e.target.value }))
              }
            />
          </label>

          <Button type="submit" size="sm" className="h-9">
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            onClick={resetFilters}
          >
            Reset
          </Button>
        </form>

        <PermissionGate action="export">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            onClick={handleExport}
            disabled={exportLeads.isPending}
          >
            {exportLeads.isPending ? "Please wait…" : "Export"}
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={9}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No leads found"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Requested Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Application Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Mobile</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sourced By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Pending In</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow key={r.code ?? r.id ?? i} className={TABLE_ROW_CLASS}>
            <TableCell className="font-mono text-xs font-medium">
              <div>{r.code ?? "—"}</div>
              {r.external_lead_id ? (
                <div className="text-[11px] text-slate-400">
                  {r.external_lead_id}
                </div>
              ) : null}
            </TableCell>
            <TableCell>{r.loan_type_name ?? "—"}</TableCell>
            <TableCell>{fmtAmount(r.loan_amount)}</TableCell>
            <TableCell>
              <div>{r.name ?? "—"}</div>
              {r.contact_name ? (
                <div className="text-[11px] text-slate-400">
                  {r.contact_name}
                </div>
              ) : null}
            </TableCell>
            <TableCell>{r.mobile ?? "—"}</TableCell>
            <TableCell>
              <div>{r.sourced_by?.user_name ?? "—"}</div>
              {r.sourced_by?.user_role ? (
                <div className="text-[11px] text-slate-400">
                  {r.sourced_by.channel_name
                    ? `${r.sourced_by.channel_name} · `
                    : ""}
                  {r.sourced_by.user_role}
                </div>
              ) : null}
            </TableCell>
            <TableCell>
              {(r.application_status ?? r.loan_status) ? (
                <Badge variant="secondary">
                  {r.application_status ?? r.loan_status}
                </Badge>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>{r.active_task?.task_name ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDateTime(r.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
