import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useVerificationList } from "./verification-list.api";

const PAGE_SIZE = 10;

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

// /operations/verification/list      = self queue (legacy VerificationList, self=true)
// /operations/verification/task/list = task list (legacy VerificationTaskList, no self)
const SELF_PATHS = new Set<string>(["/operations/verification/list"]);

export default function VerificationListPage() {
  const { pathname } = useLocation();
  const self = SELF_PATHS.has(pathname);
  const [page, setPage] = useState(1);
  const { data, isFetching } = useVerificationList({ page, self });
  const rows = data?.result ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={6}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle={self ? "Your queue is empty" : "No verification tasks"}
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>Task No</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Branch</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Zone</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Initiated</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${r.verification_code ?? ""}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="font-mono text-xs font-medium">
            {r.verification_code ?? "—"}
          </TableCell>
          <TableCell>{r.name ?? "—"}</TableCell>
          <TableCell>{r.created_by?.territory_name ?? "—"}</TableCell>
          <TableCell>{r.created_by?.parent_territory_name ?? "—"}</TableCell>
          <TableCell>
            {r.verification_status ? (
              <Badge variant="secondary">{r.verification_status}</Badge>
            ) : (
              "—"
            )}
          </TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtDateTime(r.created_by?.created_at)}
          </TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
