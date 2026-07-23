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
import { useNotificationTemplateList } from "./notification-template-list.api";
import type { TemplateRow } from "./notification-template-list.types";

export default function NotificationTemplateListPage() {
  const { data = [], isFetching } = useNotificationTemplateList();
  const { t: ts } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const list = useClientList<TemplateRow>(data, (r, q) =>
    [r.name, r.module, r.service_provider?.provider_name].some((v) =>
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
            placeholder={ts("notificationTemplate.searchPlaceholder")}
            className="h-10 rounded-full bg-white ps-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/template/create">
              <Plus className="h-4 w-4" /> {ts("notificationTemplate.addButton")}
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle={ts("notificationTemplate.emptyTitle")}
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
            <TableHead className={TABLE_HEAD_CLASS}>{ts("serialNo")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{tc("name")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("notificationTemplate.colModule")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("notificationTemplate.colProvider")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("notificationTemplate.colTemplateId")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("notificationTemplate.colFlowId")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{tc("status")}</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-end`}>
              {tc("action")}
            </TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.module ?? "—"}
            </TableCell>
            <TableCell>{r.service_provider?.provider_name ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.template_id ?? "—")}
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.flow_id ?? "—")}
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? tc("active") : tc("inactive")}
              </Badge>
            </TableCell>
            <TableCell className="text-end">
              <PermissionGate action="edit">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link to={`/settings/template/create/${String(r.id ?? "")}`}>
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
