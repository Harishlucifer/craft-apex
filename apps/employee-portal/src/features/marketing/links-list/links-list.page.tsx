import { PermissionGate } from "@craft-apex/layout";
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
import { useMarketingLinks } from "./links-list.api";
import type { LinkRow } from "./links-list.types";
import { LinksForm } from "../links-form/links-form";

// Legacy: formattedDate (utility.js) → display short ISO as locale string.
function fmt(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleString();
}

export default function MarketingLinksListPage() {
  const { data = [], isFetching } = useMarketingLinks();
  const qc = useQueryClient();
  const list = useClientList<LinkRow>(data, (r, q) =>
    [r.name, r.attribution, r.short_url, r.url].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  const [editing, setEditing] = useState<
    { linkId?: string | number } | null
  >(null);
  const onSaved = () => {
    qc.invalidateQueries({ queryKey: ["marketing-links"] });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by name, attribution, URL…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" /> Add Link
        </Button>
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No marketing links"
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
            <TableHead className={TABLE_HEAD_CLASS}>Link ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Attribution</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Short URL</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created At</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Updated At</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.link_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.link_id ?? "—")}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.attribution ?? "—"}</TableCell>
            <TableCell className="max-w-[260px] truncate text-xs text-slate-500">
              {r.short_url ? (
                <a
                  href={r.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {r.short_url}
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmt(r.created_at)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmt(r.update_at)}
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
                onClick={() => setEditing({ linkId: r.link_id })}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.linkId ? "Edit Link" : "Add New Link"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <LinksForm
              linkId={editing.linkId}
              onCancel={() => setEditing(null)}
              onSaved={onSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
