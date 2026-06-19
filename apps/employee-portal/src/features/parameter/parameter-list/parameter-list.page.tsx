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
import { useTranslation } from "@craft-apex/i18n";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useParameterList } from "./parameter-list.api";
import type { ParameterRow } from "./parameter-list.types";

export default function ParameterListPage() {
  const { data = [], isFetching } = useParameterList();
  const { t: ts } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const list = useClientList<ParameterRow>(data, (r, q) =>
    [r.code, r.name, r.type, r.source].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder={ts("parameter.searchPlaceholder")}
            className="h-10 rounded-full bg-white ps-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/parameter/create">
              <Plus className="h-4 w-4" /> {ts("parameter.addButton")}
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle={ts("parameter.emptyTitle")}
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
            <TableHead className={TABLE_HEAD_CLASS}>{ts("parameter.colParameterCode")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{tc("name")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{tc("type")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("parameter.colSourceType")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("parameter.colSource")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("parameter.colField")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{tc("status")}</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-end`}>
              {tc("action")}
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${r.parameter_id ?? r.code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs">{r.code ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.type ?? "—"}</TableCell>
            <TableCell>{r.source_type ?? "—"}</TableCell>
            <TableCell>{r.source ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.param_field ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? tc("active") : tc("inactive")}
              </Badge>
            </TableCell>
            <TableCell className="text-end">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link
                    to={`/settings/parameter/create/${String(r.parameter_id ?? "")}`}
                  >
                    <Pencil className="h-3.5 w-3.5" /> {tc("edit")}
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
