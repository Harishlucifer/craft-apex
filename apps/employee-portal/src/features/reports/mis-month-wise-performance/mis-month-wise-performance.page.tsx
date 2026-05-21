import { useMemo, useState } from "react";
import { Inbox, IndianRupee } from "lucide-react";
import { TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import {
  DateRangeFields,
  ReportShell,
  useDateRange,
} from "@/components/report-shell";
import { useReportExport } from "@/components/use-report-export";
import { useMonthWisePerformance } from "./mis-month-wise-performance.api";
import type {
  MonthWiseCard,
  MonthWiseFilter,
} from "./mis-month-wise-performance.types";

const PAGE_SIZE = 25;

function fmtINR(v?: number | string): string {
  if (v == null || v === "") return "₹ 0";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function MisMonthWisePerformancePage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<MonthWiseFilter>({});
  const { data, isFetching } = useMonthWisePerformance(appliedFilter);
  const rows = data?.month_performance_data ?? [];
  const cards = data?.dashboard ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );
  const exporter = useReportExport(
    "MONTH_WISE_PERFORMANCE",
    "month-wise-performance.xlsx"
  );

  const apply = () => {
    setAppliedFilter({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
    setPage(1);
  };

  const reset = () => {
    dateRange.reset();
    setAppliedFilter({});
    setPage(1);
  };

  return (
    <ReportShell
      title="Month-Wise Performance"
      description={`${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      onExport={() =>
        exporter.exportNow({
          start_date: appliedFilter.startDate,
          end_date: appliedFilter.endDate,
        })
      }
      exportLoading={exporter.loading}
      headerExtras={cards.length > 0 && <DashboardCards cards={cards} />}
      filters={
        <DateRangeFields
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={dateRange.setStartDate}
          onEndChange={dateRange.setEndDate}
        />
      }
    >
      <DataTableShell
        columnCount={8}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No data"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Month</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Leads #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Leads ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sanctioned #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sanctioned ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed ₹</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow
            key={`${r.month_year ?? ""}-${r.loan_type ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.month_year ?? "—"}</TableCell>
            <TableCell>{r.loan_type ?? "—"}</TableCell>
            <TableCell>{r.leads_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.loan_amount)}</TableCell>
            <TableCell>{r.sanctioned_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.sanctioned_amount)}</TableCell>
            <TableCell>{r.disbursed_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.disbursed_amount)}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

function DashboardCards({ cards }: { cards: MonthWiseCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map((card, i) => (
        <div
          key={`${card.label ?? i}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {card.label ?? "—"}
            </p>
            <span className="rounded-md bg-amber-50 p-2 text-amber-700">
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{card.count ?? 0}</p>
          {card.amount != null && card.amount !== "" && (
            <p className="text-xs text-slate-500">{fmtINR(card.amount)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
