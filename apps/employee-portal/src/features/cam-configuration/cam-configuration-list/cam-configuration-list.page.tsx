import { PermissionGate } from "@craft-apex/layout";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search } from "lucide-react";
import {
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
import { useCamConfigList } from "./cam-configuration-list.api";
import type { CamConfigRow } from "./cam-configuration-list.types";

export default function CamConfigListPage() {
  const { data = [], isFetching } = useCamConfigList();
  const list = useClientList<CamConfigRow>(data, (r, q) =>
    [r.title, r.type, r.product_code, r.loan_type_name, r.template_name].some(
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
            placeholder="Search by title, type, product, loan type…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/cam-configuration/create">
              <Plus className="h-4 w-4" /> Add CAM Configuration
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={9}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No CAM configurations found"
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
            <TableHead className={TABLE_HEAD_CLASS}>Title</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Product Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Rule</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sequence</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Template</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.cam_config_id ?? r.title ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.title ?? "—"}</TableCell>
            <TableCell>{r.type ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.product_code ?? "—"}
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.rule_id ?? "—")}
            </TableCell>
            <TableCell>{r.loan_type_name ?? "—"}</TableCell>
            <TableCell className="text-xs">{r.sequence ?? "—"}</TableCell>
            <TableCell>{r.template_name ?? "—"}</TableCell>
            <TableCell className="text-right">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link
                    to={`/settings/cam-configuration/create/${String(r.cam_config_id ?? "")}`}
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
