import { Link } from "react-router-dom";
import { PermissionGate } from "@craft-apex/layout";
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
import { useWorkflowComponentList } from "./workflow-component-list.api";
import type { WorkflowComponentRow } from "./workflow-component-list.types";

export default function WorkflowComponentListPage() {
  const { data = [], isFetching } = useWorkflowComponentList();

  const list = useClientList<WorkflowComponentRow>(data, (r, q) =>
    [
      r.code,
      r.name,
      r.workflow_type,
      r.workflow_step_type,
      typeof r.tags === "string" ? r.tags : Array.isArray(r.tags) ? r.tags.join(",") : "",
    ].some((v) => String(v ?? "").toLowerCase().includes(q))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by code, name, type, tags…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/workflow/component/create">
              <Plus className="h-4 w-4" /> Add workflow Component
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No workflow components"
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
            <TableHead className={TABLE_HEAD_CLASS}>CODE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>NAME</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>WORKFLOW TYPE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>STEP TYPE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>TAGS</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>STATUS</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              ACTION
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.id ?? "—"}</TableCell>
            <TableCell className="font-semibold text-slate-700">
              {r.code ?? "—"}
            </TableCell>
            <TableCell>{r.name ?? "—"}</TableCell>
            <TableCell>{r.workflow_type ?? "—"}</TableCell>
            <TableCell>{r.workflow_step_type ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {r.tags
                ? Array.isArray(r.tags)
                  ? r.tags.join(", ")
                  : String(r.tags)
                : "—"}
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
                    to={`/settings/workflow/component/create/${String(r.id ?? "")}`}
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

