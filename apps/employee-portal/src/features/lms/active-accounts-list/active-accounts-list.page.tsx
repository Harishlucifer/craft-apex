import { Search } from "lucide-react";
import { Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useActiveAccountsList } from "./active-accounts-list.api";
import type { ActiveAccountRow } from "./active-accounts-list.types";

const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "-"
    : `₹ ${Number(v).toLocaleString("en-IN")}`;

const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("en-IN") : "-");

export default function ActiveAccountsListPage() {
  const { data = [], isFetching } = useActiveAccountsList();
  const list = useClientList<ActiveAccountRow>(data, (r, q) =>
    [r.loan_account_no, r.borrower_name, r.loan_type_code].some((v) =>
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
          placeholder="Search by loan A/C, borrower, type…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No active accounts"
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
            <TableHead className={TABLE_HEAD_CLASS}>Loan A/C No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Borrower</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>EMI</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Updated</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${r.loan_account_no ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs font-medium">
              {r.loan_account_no ?? "—"}
            </TableCell>
            <TableCell>{r.borrower_name ?? "—"}</TableCell>
            <TableCell>{r.loan_type_code ?? "—"}</TableCell>
            <TableCell>{fmtAmount(r.disbursed_amount)}</TableCell>
            <TableCell>{fmtAmount(r.emi)}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.disbursed_date)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.updated_date)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
