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
import { useUnderwritingMatrixList } from "./delegation-matrix-list.api";
import type { UnderwritingMatrixRow } from "./delegation-matrix-list.types";

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "-";

export default function DelegationMatrixListPage() {
  const { data = [], isFetching } = useUnderwritingMatrixList();

  const list = useClientList<UnderwritingMatrixRow>(data, (r, q) =>
    [r.workflow_type, r.approver_level].some((v) =>
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
            placeholder="Search by workflow type or approve level..."
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/delegation-matrix">
              <Plus className="h-4 w-4" /> Add Underwriting
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && data.length === 0}
        isEmpty={list.total === 0}
        emptyTitle="No delegation matrices"
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
            <TableHead className={TABLE_HEAD_CLASS}>Workflow Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Approve Level</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Priority Order</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Reviewer Levels</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Updated Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.underwriting_matrix_id ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">
              {String(r.workflow_type ?? "").replace(/_/g, " ")}
            </TableCell>
            <TableCell>{r.approver_level ?? "—"}</TableCell>
            <TableCell>{r.priority_order ?? "0"}</TableCell>
            <TableCell className="max-w-[200px] truncate text-slate-500">
              {Array.isArray(r.reviewer_levels)
                ? r.reviewer_levels.join(", ")
                : "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.updated_at)}
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link
                    to={`/settings/delegation-matrix/${String(r.underwriting_matrix_id ?? "")}`}
                  >
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
