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
import { useSchemeList } from "./scheme-list.api";
import type { SchemeRow } from "./scheme-list.types";

// Legacy SchemeListView.setSchemeMode by path: payable / incentive / receivable.
// Tenant module.configuration.category overrides when provided.
function categoryFromPath(pathname: string): string {
  if (pathname.includes("payable-scheme")) return "PAYABLE";
  if (pathname.includes("receivable-scheme")) return "RECEIVABLE";
  if (pathname.includes("incentive-scheme")) return "INCENTIVE";
  if (pathname.includes("partner-scheme")) return "PAYABLE";
  return "";
}

const displayLoanType = (r: SchemeRow) =>
  r.loan_type_name ??
  (typeof r.loan_type === "string" ? r.loan_type : (r.loan_type?.name ?? "—"));

export default function SchemeListPage() {
  const { pathname } = useLocation();
  const module = useModule();
  const moduleCategory = (
    module?.node.configuration as Record<string, unknown> | undefined
  )?.category as string | undefined;
  const category = moduleCategory ?? categoryFromPath(pathname);

  const { data = [], isFetching } = useSchemeList(category);
  const list = useClientList<SchemeRow>(data, (r, q) =>
    [r.code, r.name, r.lender_name, r.scheme_type, r.mode].some((v) =>
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
          placeholder="Search by code, name, lender, mode…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={9}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle={`No ${category.toLowerCase() || "scheme"} schemes`}
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
            <TableHead className={TABLE_HEAD_CLASS}>Scheme Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Computation</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Range</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Recurring</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Mode</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.scheme_id ?? r.code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs">{r.code ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.lender_name ?? "—"}</TableCell>
            <TableCell>{displayLoanType(r)}</TableCell>
            <TableCell>{r.computation_type ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {r.computation_range ?? "—"}
            </TableCell>
            <TableCell className="text-xs">
              {r.is_recurring === true || r.is_recurring === "true"
                ? "Yes"
                : r.is_recurring === false || r.is_recurring === "false"
                  ? "No"
                  : "—"}
            </TableCell>
            <TableCell>{r.mode ?? "—"}</TableCell>
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
