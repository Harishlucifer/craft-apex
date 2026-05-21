import { Link, useLocation } from "react-router-dom";
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
import { useFieldMasterList } from "./field-master-list.api";
import type { FieldMasterRow } from "./field-master-list.types";

// /field-list -> type=FIELD ; /component-list -> type=COMPONENT  (legacy)
function typeForPath(p: string): string {
  return p === "/component-list" ? "COMPONENT" : "FIELD";
}

export default function FieldMasterListPage() {
  const { pathname } = useLocation();
  const type = typeForPath(pathname);
  const createPath = type === "COMPONENT" ? "/component/create" : "/field/create";
  const { data = [], isFetching } = useFieldMasterList(type);
  const list = useClientList<FieldMasterRow>(data, (r, q) =>
    [r.name, r.type, Array.isArray(r.tags) ? r.tags.join(",") : r.tags].some(
      (v) => String(v ?? "").toLowerCase().includes(q)
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
            placeholder={`Search ${type.toLowerCase()}s…`}
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button asChild>
          <Link to={createPath}>
            <Plus className="h-4 w-4" /> Add {type === "COMPONENT" ? "Component" : "Field"}
          </Link>
        </Button>
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle={`No ${type.toLowerCase()}s found`}
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
            <TableHead className={TABLE_HEAD_CLASS}>Sequence</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Tags</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.id ?? r.field_master_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs">{r.sequence ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.type ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {Array.isArray(r.tags) ? r.tags.join(", ") : r.tags ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="ghost" className="gap-1.5">
                <Link
                  to={`${createPath}/${String(r.id ?? r.field_master_id ?? "")}`}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
