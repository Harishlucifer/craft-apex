import { useState } from "react";
import { useLocation } from "react-router-dom";
import { TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useBeatPlanList } from "./beat-plan-list.api";

const PAGE_SIZE = 10;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "-";
const fmtTime = (v?: string) =>
  v ? new Date(v).toLocaleTimeString("en-IN") : "-";

// Legacy /beat-actual/view passes `to_date = yesterday` (module.code === "ACTUAL_VIEW").
export default function BeatPlanListPage() {
  const { pathname } = useLocation();
  const isActualView = pathname === "/beat-actual/view";
  const [page, setPage] = useState(1);

  const yesterday = isActualView
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : undefined;

  const { data, isFetching } = useBeatPlanList({
    page,
    actualViewToDate: yesterday,
  });
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={7}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle="No beat plans"
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Employee</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Start</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>End</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Distance</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Planned</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Completed</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${String(r.beat_plan_id ?? "")}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="text-sm">{fmtDate(r.beat_date)}</TableCell>
          <TableCell className="font-medium">
            {r.employee_name ?? r.user_name ?? "—"}
          </TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtTime(r.start_time)}
          </TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtTime(r.end_time)}
          </TableCell>
          <TableCell>{r.total_distance ?? "—"}</TableCell>
          <TableCell className="text-sm">{r.planned_visits ?? "—"}</TableCell>
          <TableCell className="text-sm">{r.visits_completed ?? "—"}</TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
