import { Search } from "lucide-react";
import { Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useTranslation } from "@craft-apex/i18n";
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
  const { t: ts } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const list = useClientList<RuleCategoryRow>(data, (r, q) =>
    [r.name, r.scope, r.category_type, r.rule_type, r.journey_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder={ts("ruleCategory.searchPlaceholder")}
          className="h-10 rounded-full bg-white ps-9"
        />
      </div>

      <DataTableShell
        columnCount={8}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle={ts("ruleCategory.emptyTitle")}
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
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colScope")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colCategoryType")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colRuleType")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colLoanType")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colJourneyType")}</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>{ts("ruleCategory.colLender")}</TableHead>
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
