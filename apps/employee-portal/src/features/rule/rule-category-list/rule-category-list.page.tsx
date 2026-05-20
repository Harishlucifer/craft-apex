import { Search } from "lucide-react";
import { Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useRuleCategoryList } from "./rule-category-list.api";
import type { RuleCategoryRow } from "./rule-category-list.types";

const displayLoanType = (lt: RuleCategoryRow["loan_type"]) =>
  !lt ? "—" : typeof lt === "string" ? lt : (lt.loan_type_name ?? "—");
const displayLender = (l: RuleCategoryRow["lender"]) =>
  !l ? "—" : typeof l === "string" ? l : (l.lender_name ?? "—");

export default function RuleCategoryListPage() {
  const { data = [], isFetching } = useRuleCategoryList();
  const list = useClientList<RuleCategoryRow>(data, (r, q) =>
    [r.name, r.scope, r.category_type, r.rule_type, r.journey_type].some((v) =>
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
          placeholder="Search by name, scope, type…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No rule categories found"
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
            <TableHead className={TABLE_HEAD_CLASS}>Scope</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Category Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Rule Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Journey Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.rule_category_id ?? r.name ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.scope ?? "—"}</TableCell>
            <TableCell>{r.category_type ?? "—"}</TableCell>
            <TableCell>{r.rule_type ?? "—"}</TableCell>
            <TableCell>{displayLoanType(r.loan_type)}</TableCell>
            <TableCell>{r.journey_type ?? "—"}</TableCell>
            <TableCell>{displayLender(r.lender)}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
