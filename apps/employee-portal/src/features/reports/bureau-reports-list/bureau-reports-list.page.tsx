// Bureau Reports List — port of /Components/Reports/RegulatoryReporting/
// BureauReporting/BureauReporsListView.js.
//
// MOCK-ONLY: legacy page renders hardcoded data and an "Add" button that
// navigates to /reports/bureau-report-flow. Columns mirrored verbatim:
//   PERIOD · GENERATED ON · ACCOUNTS · BUREAU SUBMISSIONS · ACTIONS

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Inbox, Plus } from "lucide-react";
import {
  Badge,
  Button,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useBureauReportsList } from "./bureau-reports-list.api";
import type { BureauReportRow } from "./bureau-reports-list.types";

const PAGE_SIZE = 10;

export default function BureauReportsListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useBureauReportsList();
  const rows = data ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bureau Reporting List
          </h1>
          <p className="text-sm text-slate-500">
            Generated bureau submissions across CIBIL, Experian, Equifax & CRIF.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/reports/bureau-report-flow")}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <DataTableShell
        columnCount={5}
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No bureau reports"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>PERIOD</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>GENERATED ON</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>ACCOUNTS</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>
              BUREAU SUBMISSIONS
            </TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>ACTIONS</TableHead>
          </TableRow>
        }
      >
        {paged.map((row) => (
          <TableRow key={row.id} className={TABLE_ROW_CLASS}>
            <TableCell>
              <div className="text-sm font-semibold text-slate-900">
                {row.period}
              </div>
              <div className="text-[11px] text-slate-500">{row.periodSub}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm font-medium text-slate-800">
                {row.generatedOn}
              </div>
              <div className="text-[11px] text-slate-500">
                {row.generatedTime}
              </div>
            </TableCell>
            <TableCell className="text-sm text-slate-800">
              {row.accounts}
            </TableCell>
            <TableCell>
              <SubmissionBadges row={row} />
            </TableCell>
            <TableCell>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
                onClick={() =>
                  navigate(`/reports/bureau-report-flow/${row.id}`, {
                    state: { reportData: row },
                  })
                }
              >
                View List <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}

function SubmissionBadges({ row }: { row: BureauReportRow }) {
  const entries = Object.entries(row.submissions) as Array<
    [keyof BureauReportRow["submissions"], boolean]
  >;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entries.map(([key, value]) => (
        <Badge
          key={key}
          className={
            value
              ? "flex items-center gap-1 bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
              : "bg-slate-100 text-[10px] uppercase tracking-wide text-slate-500"
          }
        >
          {key}
          {value && <Check className="h-3 w-3" />}
        </Badge>
      ))}
    </div>
  );
}
