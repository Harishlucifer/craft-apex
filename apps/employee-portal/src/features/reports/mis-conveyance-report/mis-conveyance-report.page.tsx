import { useMemo, useState } from "react";
import {
  Calculator,
  Coins,
  HandCoins,
  Inbox,
  IndianRupee,
  ListTodo,
  Route,
  Bike,
} from "lucide-react";
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
import { useConveyanceReport } from "./mis-conveyance-report.api";
import {
  verificationCategoryLabel,
  type ConveyanceCard,
  type ConveyanceFilter,
} from "./mis-conveyance-report.types";

const PAGE_SIZE = 25;

function fmtINR(v?: number | string): string {
  if (v == null || v === "") return "₹ 0";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function fmtDate(v?: string): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN");
}

function amount(row: { total_distance?: number | string; rate_per_kilometer?: number | string }) {
  const km = Number(row.total_distance ?? 0);
  const rate = Number(row.rate_per_kilometer ?? 0);
  if (Number.isNaN(km) || Number.isNaN(rate)) return "—";
  return (km * rate).toFixed(2);
}

export default function MisConveyanceReportPage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<ConveyanceFilter>({});
  const { data, isFetching } = useConveyanceReport(appliedFilter);
  const rows = data?.report_data ?? [];
  const cards = data?.dashboard ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );
  const exporter = useReportExport(
    "VERIFICATION_CONVEYANCE",
    "conveyance-report.xlsx"
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
      title="Conveyance Report"
      description={`${rows.length} ${
        rows.length === 1 ? "verification" : "verifications"
      }`}
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      onExport={() =>
        exporter.exportNow({
          startDate: appliedFilter.startDate,
          endDate: appliedFilter.endDate,
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
        columnCount={6}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No conveyance entries"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Verification</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Category</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Distance / Rate</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Amount</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow
            key={`${r.verification_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">
              {r.verification_code ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.attempt_date)}
            </TableCell>
            <TableCell>{r.applicant_name ?? "—"}</TableCell>
            <TableCell>{verificationCategoryLabel(r.verification_category)}</TableCell>
            <TableCell>
              <div className="text-sm font-medium text-slate-800">
                {r.total_distance ?? 0} km
              </div>
              <div className="text-[11px] text-slate-500">
                @ {fmtINR(r.rate_per_kilometer)}
              </div>
            </TableCell>
            <TableCell className="font-semibold text-slate-900">
              ₹ {amount(r)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

// Legacy maps the dashboard label to an icon — we mirror that here.
function iconForLabel(label?: string) {
  if (!label) return <Calculator className="h-4 w-4" />;
  if (label === "Total Distance") return <Route className="h-4 w-4" />;
  if (label === "Avg. Distance") return <Bike className="h-4 w-4" />;
  if (label === "Total Tasks") return <ListTodo className="h-4 w-4" />;
  if (label === "Total Earned") return <HandCoins className="h-4 w-4" />;
  return <Coins className="h-4 w-4" />;
}

function toneForLabel(label?: string): string {
  if (label === "Total Distance") return "bg-indigo-50 text-indigo-700";
  if (label === "Avg. Distance") return "bg-rose-50 text-rose-700";
  if (label === "Total Tasks") return "bg-amber-50 text-amber-700";
  if (label === "Total Earned") return "bg-emerald-50 text-emerald-700";
  return "bg-sky-50 text-sky-700";
}

function DashboardCards({ cards }: { cards: ConveyanceCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => (
        <div
          key={`${card.label ?? i}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {card.label ?? "—"}
            </p>
            <span className={`rounded-md p-2 ${toneForLabel(card.label)}`}>
              {iconForLabel(card.label)}
            </span>
          </div>
          <p className="flex items-center gap-1 text-2xl font-bold text-slate-900">
            {card.label === "Total Earned" && (
              <IndianRupee className="h-4 w-4 text-slate-400" />
            )}
            {String(card.amount ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}
