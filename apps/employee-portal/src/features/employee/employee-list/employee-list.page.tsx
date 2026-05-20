import { useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useEmployeeList } from "./employee-list.api";

const PAGE_SIZE = 10; // legacy groupSize

export default function EmployeeListPage() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useEmployeeList(page);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={8}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle="No employees found"
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>Employee ID</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Employee Code</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Username</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Email</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Mobile</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Role</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Reports To</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${String(r.employee_id ?? r.employee_code ?? "")}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="font-mono text-xs text-slate-500">
            {String(r.employee_id ?? "—")}
          </TableCell>
          <TableCell className="font-mono text-xs">
            {r.employee_code ?? "—"}
          </TableCell>
          <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
          <TableCell className="text-slate-600">{r.email ?? "—"}</TableCell>
          <TableCell>{r.mobile ?? "—"}</TableCell>
          <TableCell>{r.role?.name ?? "—"}</TableCell>
          <TableCell>
            <div>{r.supervisor_user?.name ?? "—"}</div>
            <div className="font-mono text-[11px] text-slate-400">
              {r.supervisor_user?.employee_code ?? ""}
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={r.status === 1 ? "success" : "destructive"}>
              {r.status === 1 ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
