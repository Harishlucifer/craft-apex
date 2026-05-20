import { useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useAskList } from "./ask-list.api";

const PAGE_SIZE = 10;

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

export default function AskListPage() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useAskList(page);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={8}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle="No asks pending"
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
          <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Type of Ask</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Remarks</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Raised By</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Raised</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${String(r.ask_id ?? r.application_code ?? "")}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="font-mono text-xs font-medium">
            {r.application_code ?? "—"}
          </TableCell>
          <TableCell>
            <div>{r.name ?? "—"}</div>
            <div className="text-[11px] text-slate-400">{r.mobile ?? ""}</div>
          </TableCell>
          <TableCell>{r.loan_type_name ?? "—"}</TableCell>
          <TableCell>{r.type_of_ask ?? r.ask_name ?? "—"}</TableCell>
          <TableCell
            className="max-w-[260px] truncate text-slate-500"
            title={r.remarks ?? ""}
          >
            {r.remarks ?? "—"}
          </TableCell>
          <TableCell>{r.raised_by?.user_name ?? "—"}</TableCell>
          <TableCell>
            {r.status != null ? (
              <Badge variant="secondary">{String(r.status)}</Badge>
            ) : (
              "—"
            )}
          </TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtDateTime(r.raised_at ?? r.createdAt)}
          </TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
