import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search } from "lucide-react";
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
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useServiceProviderList } from "./service-provider-list.api";
import type { ServiceProviderRow } from "./service-provider-list.types";
import { ServiceProviderForm } from "../service-provider-form/service-provider-form";

export default function ServiceProviderListPage() {
  const { data = [], isFetching } = useServiceProviderList();
  const qc = useQueryClient();
  const list = useClientList<ServiceProviderRow>(data, (r, q) =>
    [r.name, r.type, r.provider_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  // Dialog state: undefined = closed; null = create; row = edit
  const [editing, setEditing] = useState<
    ServiceProviderRow | null | undefined
  >(undefined);
  const open = editing !== undefined;
  const close = () => setEditing(undefined);

  const onSaved = () => {
    qc.invalidateQueries({ queryKey: ["service-provider-list"] });
    close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by name, type…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Add Service Provider
        </Button>
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No service providers found"
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
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Credentials</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow key={`${String(r.id ?? "")}-${i}`} className={TABLE_ROW_CLASS}>
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.type ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs text-slate-500">
              {r.credentials ? Object.keys(r.credentials).length + " keys" : "—"}
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
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service Provider" : "Add Service Provider"}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <ServiceProviderForm
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
