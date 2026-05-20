import { useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useNewChannelList } from "./new-channel-list.api";

const PAGE_SIZE = 10;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

function statusBadge(s: number | string | undefined) {
  const n = typeof s === "string" ? Number(s) : s;
  if (n === 3) return <Badge variant="success">Approved</Badge>;
  if (n === 1) return <Badge variant="warning">In Progress</Badge>;
  if (n === 2 || n === 4)
    return <Badge variant="warning">Pending Approval</Badge>;
  if (n === -1) return <Badge variant="destructive">Rejected</Badge>;
  if (n === -2) return <Badge variant="secondary">Archived</Badge>;
  if (n === -3) return <Badge variant="destructive">Inactive</Badge>;
  return <Badge variant="secondary">{String(s ?? "—")}</Badge>;
}

export default function NewChannelListPage() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useNewChannelList(page);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={7}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle="No channels"
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>S.No</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Partner Code</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Partner Name</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Mobile</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${String(r.channel_id ?? r.dsa_code ?? "")}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="text-xs text-slate-500">
            {(page - 1) * PAGE_SIZE + i + 1}
          </TableCell>
          <TableCell className="font-mono text-xs">{r.dsa_code ?? "—"}</TableCell>
          <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
          <TableCell>{r.mobile ?? "—"}</TableCell>
          <TableCell>{r.onb_territory_name ?? "—"}</TableCell>
          <TableCell>{statusBadge(r.status)}</TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtDate(r.createdAt)}
          </TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
