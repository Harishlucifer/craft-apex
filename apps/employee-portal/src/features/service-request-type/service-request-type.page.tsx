import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power, Search } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  useSaveServiceRequestType,
  useServiceRequestTypeList,
} from "./service-request-type.api";
import type { ServiceRequestTypeRow } from "./service-request-type.types";
import { ServiceRequestTypeForm } from "./service-request-type-form";

export default function ServiceRequestTypePage() {
  const { data = [], isFetching } = useServiceRequestTypeList();
  const qc = useQueryClient();
  const save = useSaveServiceRequestType();

  const list = useClientList<ServiceRequestTypeRow>(data, (r, q) =>
    [r.code, r.name, r.category, r.workflow_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  const [editing, setEditing] = useState<
    ServiceRequestTypeRow | null | undefined
  >(undefined);
  const open = editing !== undefined;
  const close = () => setEditing(undefined);

  const onSaved = () => {
    qc.invalidateQueries({ queryKey: ["service-request-type-list"] });
    close();
  };

  // Legacy "delete": POST with status=0 to deactivate.
  const onDeactivate = async (r: ServiceRequestTypeRow) => {
    if (!r.id) return;
    if (!confirm(`Deactivate "${r.name}"?`)) return;
    try {
      await save.mutateAsync({ ...r, id: String(r.id), status: 0 });
      toast.success("Service Request Type has been deactivated.");
      qc.invalidateQueries({ queryKey: ["service-request-type-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by code, name, category, workflow…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Add Service Request Type
        </Button>
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No service request types"
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
            <TableHead className={TABLE_HEAD_CLASS}>Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Category</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Workflow</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs font-medium">
              {r.code ?? "—"}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.category ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="secondary">{r.workflow_type ?? "—"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => setEditing(r)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              {r.status === 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-rose-600 hover:text-rose-700"
                  onClick={() => onDeactivate(r)}
                  disabled={save.isPending}
                >
                  <Power className="h-3.5 w-3.5" /> Deactivate
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service Request Type" : "Add Service Request Type"}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <ServiceRequestTypeForm
              initial={editing ?? undefined}
              onCancel={close}
              onSaved={onSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
