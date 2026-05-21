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
import { usePendencyReport } from "./mis-pendency-report.api";
import type {
  PendencyDashboardCard,
  PendencyReportFilter,
} from "./mis-pendency-report.types";

const PAGE_SIZE = 25;

// Legacy AmountExtractor formats with Indian comma grouping + ₹.
function fmtINR(v?: number | string): string {
  if (v == null || v === "") return "₹ 0";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function MisPendencyReportPage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<PendencyReportFilter>({});
  const { data, isFetching } = usePendencyReport(appliedFilter);
  const rows = data?.pendency_report_data ?? [];
  const cards = data?.dashboard ?? [];
  const total = rows.length;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const exporter = useReportExport("PENDENCY_REPORT", "pendency-report.xlsx");

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
      title="Pendency Report"
      description={`${total} ${total === 1 ? "bucket" : "buckets"}`}
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
        columnCount={11}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No pendency data"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Bucket (From-To)</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Submission #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Submission ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Processing #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Processing ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Bank Submission #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Bank Submission ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>With Bank #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>With Bank ₹</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursement Pending #</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursement Pending ₹</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow key={`${r.from_to ?? i}`} className={TABLE_ROW_CLASS}>
            <TableCell className="font-medium">{r.from_to ?? "—"}</TableCell>
            <TableCell>{r.lead_submission_pending_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.lead_submission_pending_amount)}</TableCell>
            <TableCell>{r.lead_processing_pending_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.lead_processing_pending_amount)}</TableCell>
            <TableCell>{r.bank_submission_pending_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.bank_submission_pending_amount)}</TableCell>
            <TableCell>{r.pending_with_bank_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.pending_with_bank_amount)}</TableCell>
            <TableCell>{r.pending_for_disbursement_count ?? 0}</TableCell>
            <TableCell>{fmtINR(r.pending_for_disbursement_amount)}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

function DashboardCards({ cards }: { cards: PendencyDashboardCard[] }) {
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
            <span className="rounded-md bg-indigo-50 p-2 text-indigo-700">
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
