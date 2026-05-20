import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useModule } from "@craft-apex/layout";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { usePayoutPlanList } from "./payout-plan-list.api";
import type { PayoutPlanRow } from "./payout-plan-list.types";

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "-";

const displayTerritory = (r: PayoutPlanRow) =>
  r.territory_name ??
  (typeof r.territory === "string" ? r.territory : (r.territory?.name ?? "—"));

// Legacy PayoutListView: `isPayable = location.pathname.includes('payout-plan-list')`
// → userType = isPayable ? "CHANNEL" : "EMPLOYEE". Module configuration
// supplies `category`.
function userTypeFromPath(p: string): "CHANNEL" | "EMPLOYEE" {
  return p.includes("payout-plan-list") ? "CHANNEL" : "EMPLOYEE";
}

export default function PayoutPlanListPage() {
  const { pathname } = useLocation();
  const module = useModule();
  const category = (
    module?.node.configuration as Record<string, unknown> | undefined
  )?.category as string | undefined;
  const userType = userTypeFromPath(pathname);

  const { data = [], isFetching } = usePayoutPlanList({ userType, category });
  const list = useClientList<PayoutPlanRow>(data, (r, q) =>
    [r.code, r.name, r.description].some((v) =>
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
          placeholder="Search by code, name, description…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No payout plans"
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
            <TableHead className={TABLE_HEAD_CLASS}>Description</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Standard</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Updated</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.payout_plan_id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs">{r.code ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell
              className="max-w-[260px] truncate text-slate-500"
              title={r.description ?? ""}
            >
              {r.description ?? "—"}
            </TableCell>
            <TableCell>{displayTerritory(r)}</TableCell>
            <TableCell className="text-xs">
              {r.is_standard === true || r.is_standard === "true"
                ? "Yes"
                : r.is_standard === false || r.is_standard === "false"
                  ? "No"
                  : "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.createdAt)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.updatedAt)}
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
