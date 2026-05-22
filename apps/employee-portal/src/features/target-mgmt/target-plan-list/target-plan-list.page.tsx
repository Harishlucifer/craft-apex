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
import { useTargetPlanList } from "./target-plan-list.api";
import type { TargetPlanRow } from "./target-plan-list.types";

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "-";

export default function TargetPlanListPage() {
  const { data = [], isFetching } = useTargetPlanList();
  const list = useClientList<TargetPlanRow>(data, (r, q) =>
    [r.name, r.description, r.user_type, r.user_role?.name].some((v) =>
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
            placeholder="Search by name, user type, role…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/target/add-plan">
              <Plus className="h-4 w-4" /> Add Target Plan
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No target plans"
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
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Description</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>User Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Role / Category</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Start</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>End</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.target_plan_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell
              className="max-w-[280px] truncate text-slate-500"
              title={r.description ?? ""}
            >
              {r.description ?? "—"}
            </TableCell>
            <TableCell>{r.user_type ?? "—"}</TableCell>
            <TableCell>{r.user_role?.name ?? r.partner_category ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.start_period)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.end_period)}
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
                    to={`/target/add-plan/${String(r.target_plan_id ?? "")}`}
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
