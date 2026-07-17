import { PermissionGate } from "@craft-apex/layout";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { api } from "@/lib/api";
import { useWorkflowList } from "./workflow-list.api";
import type { WorkflowRow } from "./workflow-list.types";

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "-";

export default function WorkflowListPage() {
  const { data = [], isFetching } = useWorkflowList();
  const list = useClientList<WorkflowRow>(data, (r, q) =>
    [r.name, r.workflow_type, r.mode].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async (params: { id: string | number; status: number }) => {
      const payload = { id: params.id, status: params.status };
      return api.post<unknown, any>("/alpha/v1/workflow", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-list"] });
      toast.success("Status updated successfully");
      setUpdatingId(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
      setUpdatingId(null);
    },
  });

  const handleStatusChange = (
    id: string | number | undefined,
    newStatus: number
  ) => {
    if (!id) return;
    setUpdatingId(id);
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by name, type, mode…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/workflow/create">
              <Plus className="h-4 w-4" /> Add New
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No workflows"
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
            <TableHead className={TABLE_HEAD_CLASS}>Workflow Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Mode</TableHead>
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
            key={`${String(r.id ?? r.workflow_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.workflow_type ?? "—"}</TableCell>
            <TableCell>
              {r.mode ? <Badge variant="secondary">{r.mode}</Badge> : "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.start_date)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.end_date)}
            </TableCell>
            <TableCell>
              <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm">
                <button
                  type="button"
                  disabled={updatingId === (r.id ?? r.workflow_id)}
                  onClick={() => handleStatusChange(r.id ?? r.workflow_id, 1)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    r.status === 1
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } ${updatingId === (r.id ?? r.workflow_id) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Active
                </button>
                <button
                  type="button"
                  disabled={updatingId === (r.id ?? r.workflow_id)}
                  onClick={() => handleStatusChange(r.id ?? r.workflow_id, -1)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    r.status !== 1
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } ${updatingId === (r.id ?? r.workflow_id) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Inactive
                </button>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link
                    to={`/settings/workflow/create/${String(r.id ?? r.workflow_id ?? "")}`}
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
