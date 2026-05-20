import { Search } from "lucide-react";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useModule } from "@craft-apex/layout";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useCampaignList } from "./campaign-list.api";
import type { CampaignRow } from "./campaign-list.types";

export default function CampaignListPage() {
  const module = useModule();
  // Legacy reads attribution from module.configuration; pass through if present.
  const attribution = (
    module?.node.configuration as Record<string, unknown> | undefined
  )?.attribution as string | undefined;

  const { data = [], isFetching } = useCampaignList(attribution);
  const list = useClientList<CampaignRow>(data, (r, q) =>
    [r.name, r.data_source, r.attribution, r.description].some((v) =>
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
          placeholder="Search by name, source, attribution…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No campaigns"
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
            <TableHead className={TABLE_HEAD_CLASS}>Data Source</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Attribution</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Description</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.campaign_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.data_source ?? "—"}</TableCell>
            <TableCell>{r.attribution ?? "—"}</TableCell>
            <TableCell
              className="max-w-[280px] truncate text-slate-500"
              title={r.description ?? ""}
            >
              {r.description ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
