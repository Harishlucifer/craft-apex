import { Search } from "lucide-react";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useCollectionUploadList } from "./upload-list.api";
import type { CollectionUploadRow } from "./upload-list.types";

const displayLender = (l: CollectionUploadRow["lender"]) =>
  !l ? "—" : typeof l === "string" ? l : (l.name ?? "—");

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

export default function CollectionUploadListPage() {
  const { data = [], isFetching } = useCollectionUploadList();
  const list = useClientList<CollectionUploadRow>(data, (r, q) =>
    [r.filename, r.lender_name].some((v) =>
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
          placeholder="Search by filename or lender…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={5}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No uploaded collections"
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
            <TableHead className={TABLE_HEAD_CLASS}>File Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Processed</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Upload Date</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.upload_id ?? r.filename ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.upload_id ?? "—")}
            </TableCell>
            <TableCell className="font-medium">{r.filename ?? "—"}</TableCell>
            <TableCell>{r.lender_name ?? displayLender(r.lender)}</TableCell>
            <TableCell>
              <Badge
                variant={r.is_processed ? "success" : "secondary"}
              >
                {r.is_processed ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDateTime(r.uploaded_at)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
