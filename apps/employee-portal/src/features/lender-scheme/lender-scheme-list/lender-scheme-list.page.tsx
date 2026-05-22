import { PermissionGate } from "@craft-apex/layout";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search } from "lucide-react";
import {
  Badge,
  Button,
  Input,
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
import { useClientList } from "@/components/use-client-list";
import { useLenderSchemeList } from "./lender-scheme-list.api";
import type { LenderSchemeRow } from "./lender-scheme-list.types";

const displayLoanType = (lt: LenderSchemeRow["loan_type"]) =>
  !lt ? "—" : typeof lt === "string" ? lt : (lt.name ?? "—");

export default function LenderSchemeListPage() {
  const { data = [], isFetching } = useLenderSchemeList();
  const list = useClientList<LenderSchemeRow>(data, (r, q) =>
    [r.code, r.name, r.lender_name].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by code, scheme, lender…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/add-scheme">
              <Plus className="h-4 w-4" /> Add Lender Scheme
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No lender schemes"
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
            <TableHead className={TABLE_HEAD_CLASS}>S.No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Scheme</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.scheme_id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-mono text-xs">{r.code ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.lender_name ?? "—"}</TableCell>
            <TableCell>{displayLoanType(r.loan_type)}</TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link to={`/settings/add-scheme/${String(r.scheme_id ?? "")}`}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
              </PermissionGate>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
