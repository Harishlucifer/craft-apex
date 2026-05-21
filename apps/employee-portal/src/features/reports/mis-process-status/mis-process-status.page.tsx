import { useMemo, useState } from "react";
import { Inbox, IndianRupee, Users } from "lucide-react";
import { TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import {
  DateRangeFields,
  ReportShell,
  useDateRange,
} from "@/components/report-shell";
import { useReportExport } from "@/components/use-report-export";
import { useProcessStatus } from "./mis-process-status.api";
import type {
  ProcessStatusFilter,
  ProcessStatusRow,
  ProcessStatusSummary,
} from "./mis-process-status.types";

const PAGE_SIZE = 25;

function fmtINR(v?: number | string): string {
  if (v == null || v === "") return "₹ 0";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function fmtDate(v?: string): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN");
}

function sourcedBy(row: ProcessStatusRow): string {
  if (row.sourcing_channel_id) return row.sourcing_channel_name ?? "—";
  return row.sourced_by_name ?? "—";
}

export default function MisProcessStatusPage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<ProcessStatusFilter>({});
  const { data, isFetching } = useProcessStatus(appliedFilter);
  const rows = data?.process_report_list ?? [];
  const summary = data?.summary ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );
  const exporter = useReportExport("PROCESS_STATUS_REPORT", "process-status.xlsx");

  const apply = () => {
    setAppliedFilter({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
    setPage(1);
  };

  const reset = () => {
    dateRange.reset();
    setAppliedFilter({});
    setPage(1);
  };

  return (
    <ReportShell
      title="Process Status"
      description={`${rows.length} ${rows.length === 1 ? "application" : "applications"}`}
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      onExport={() =>
        exporter.exportNow({
          start_date: appliedFilter.startDate,
          end_date: appliedFilter.endDate,
        })
      }
      exportLoading={exporter.loading}
      headerExtras={summary.length > 0 && <SummaryCards summary={summary} />}
      filters={
        <DateRangeFields
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={dateRange.setStartDate}
          onEndChange={dateRange.setEndDate}
        />
      }
    >
      <DataTableShell
        columnCount={11}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No applications in this window"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>App ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sourced By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow
            key={`${r.application_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">
              {r.application_code ?? "—"}
            </TableCell>
            <TableCell>{sourcedBy(r)}</TableCell>
            <TableCell>{r.application_name ?? "—"}</TableCell>
            <TableCell>{r.loan_type_name ?? "—"}</TableCell>
            <TableCell>{fmtINR(r.application_loan_amount)}</TableCell>
            <TableCell>
              <div>{r.application_status_string ?? "—"}</div>
              {r.lender_apply_status_string && (
                <div className="text-[11px] text-slate-400">
                  {r.lender_apply_status_string}
                </div>
              )}
            </TableCell>
            <TableCell>{r.territory_ground_name ?? "—"}</TableCell>
            <TableCell>{r.lender_name ?? "—"}</TableCell>
            <TableCell>{fmtINR(r.disbursed_amount)}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.disbursed_date)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.application_created_at)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

function SummaryCards({ summary }: { summary: ProcessStatusSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {summary.map((card, i) => {
        // First card is Total Lead count; rest are amounts.
        const isCount = i === 0;
        return (
          <div
            key={`${card.label ?? i}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {card.label ?? "—"}
              </p>
              <span
                className={`rounded-md p-2 ${
                  isCount
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {isCount ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <IndianRupee className="h-4 w-4" />
                )}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {isCount ? (card.value ?? 0) : fmtINR(card.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
