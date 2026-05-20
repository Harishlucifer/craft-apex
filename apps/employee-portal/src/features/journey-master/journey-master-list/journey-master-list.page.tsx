import { Search } from "lucide-react";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useJourneyTypeList } from "./journey-master-list.api";
import type { JourneyTypeRow } from "./journey-master-list.types";

const displayLoanType = (lt: JourneyTypeRow["loan_type"]) =>
  !lt ? "—" : typeof lt === "string" ? lt : (lt.name ?? "—");

export default function JourneyMasterListPage() {
  const { data = [], isFetching } = useJourneyTypeList();
  const list = useClientList<JourneyTypeRow>(data, (r, q) =>
    [r.code, r.name, r.workflow_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search by code, name, type…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No journey types"
        pagination={{
          page: list.page,
          totalPages: list.totalPages,
          total: list.total,
          pageSize: list.pageSize,
          onPageChange: list.setPage,
          onPageSizeChange: list.setPageSize,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Workflow Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.id ?? "—")}
            </TableCell>
            <TableCell className="font-mono text-xs">{r.code ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{displayLoanType(r.loan_type)}</TableCell>
            <TableCell>{r.workflow_type ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
