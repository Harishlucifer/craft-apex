import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Inbox,
  MapPin,
  PhoneCall,
  TrendingUp,
  Users,
  Footprints,
  Info,
} from "lucide-react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
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
import {
  useDailySalesReport,
  useSalesDisposition,
} from "./mis-daily-sales-report.api";
import type {
  DailySalesFilter,
  DispositionRow,
  SalesRow,
} from "./mis-daily-sales-report.types";

const PAGE_SIZE = 25;

const capitalize = (s?: string): string => {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN");
}

/**
 * Daily Sales Report — legacy
 * `/pages/MIS/DailySalesReport.js` + 3 sub-components (SalesSummaryReport,
 * PerformanceAnalysis, DispositionDetails). PerformanceAnalysis renders
 * recharts Bar + Pie charts — deferred until we add a charting library; the
 * dashboard counts are surfaced as summary cards instead.
 *
 * Shared by `/activity/daily-activity` and `/reports/mis/daily-sales-report`.
 */
export default function MisDailySalesReportPage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<DailySalesFilter>({});
  const { data: report, isFetching: salesLoading } = useDailySalesReport(appliedFilter);
  const { data: dispositions = [], isFetching: dispLoading } =
    useSalesDisposition(appliedFilter);

  const sales = report?.sales ?? [];
  const dashboard = report?.dashboard ?? {};

  const [salesPage, setSalesPage] = useState(1);
  const salesPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const pagedSales = useMemo(
    () => sales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE),
    [sales, salesPage]
  );

  const [dispPage, setDispPage] = useState(1);
  const dispPages = Math.max(1, Math.ceil(dispositions.length / PAGE_SIZE));
  const pagedDisp = useMemo(
    () => dispositions.slice((dispPage - 1) * PAGE_SIZE, dispPage * PAGE_SIZE),
    [dispositions, dispPage]
  );

  const exporter = useReportExport("DAILY_SALES_REPORT", "daily-sales.xlsx");

  const apply = () => {
    setAppliedFilter({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
    setSalesPage(1);
    setDispPage(1);
  };

  const reset = () => {
    dateRange.reset();
    setAppliedFilter({});
    setSalesPage(1);
    setDispPage(1);
  };

  return (
    <ReportShell
      title="Daily Sales Report"
      description={`${sales.length} sales reps · ${dispositions.length} dispositions`}
      searchLoading={salesLoading && sales.length === 0}
      onSearch={apply}
      onReset={reset}
      onExport={() =>
        exporter.exportNow({
          start_date: appliedFilter.startDate,
          end_date: appliedFilter.endDate,
        })
      }
      exportLoading={exporter.loading}
      headerExtras={<OutcomeCards dashboard={dashboard} />}
      filters={
        <DateRangeFields
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={dateRange.setStartDate}
          onEndChange={dateRange.setEndDate}
        />
      }
    >
      <SalesSummaryTable
        sales={pagedSales}
        page={salesPage}
        totalPages={salesPages}
        total={sales.length}
        onPageChange={setSalesPage}
        loading={salesLoading && sales.length === 0}
      />
      <DispositionTable
        rows={pagedDisp}
        page={dispPage}
        totalPages={dispPages}
        total={dispositions.length}
        onPageChange={setDispPage}
        loading={dispLoading && dispositions.length === 0}
      />
    </ReportShell>
  );
}

// ─── Outcome summary cards ─────────────────────────────────────────────────
// Legacy DailySalesReport iterates dashboard entries and picks an icon per
// label. We reuse the same labels and pick lucide icons.

function iconForLabel(label: string) {
  switch (label) {
    case "total_leads":
      return { icon: <Users className="h-4 w-4" />, tone: "indigo" as const };
    case "total_calls":
    case "total_call":
      return { icon: <PhoneCall className="h-4 w-4" />, tone: "emerald" as const };
    case "total_visits":
    case "total_visit":
      return { icon: <MapPin className="h-4 w-4" />, tone: "amber" as const };
    case "follow_up_completed":
    case "followup_completed":
      return { icon: <CheckCircle2 className="h-4 w-4" />, tone: "emerald" as const };
    case "follow_up_due":
    case "followup_due":
      return { icon: <CalendarClock className="h-4 w-4" />, tone: "sky" as const };
    case "follow_up_overdue":
    case "followup_overdue":
      return { icon: <CalendarClock className="h-4 w-4" />, tone: "rose" as const };
    case "follow_up_upcoming":
    case "followup_upcoming":
      return { icon: <CalendarClock className="h-4 w-4" />, tone: "indigo" as const };
    default:
      return { icon: <TrendingUp className="h-4 w-4" />, tone: "slate" as const };
  }
}

const TONE_CLASS: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

function OutcomeCards({
  dashboard,
}: {
  dashboard: Record<string, number | string>;
}) {
  const entries = Object.entries(dashboard);
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {entries.map(([key, value]) => {
        const { icon, tone } = iconForLabel(key);
        return (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {humanizeKey(key)}
              </p>
              <span className={`rounded-md p-2 ${TONE_CLASS[tone]}`}>
                {icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sales Rep summary table ───────────────────────────────────────────────

interface SalesTableProps {
  sales: SalesRow[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  loading: boolean;
}

function SalesSummaryTable({
  sales,
  page,
  totalPages,
  total,
  onPageChange,
  loading,
}: SalesTableProps) {
  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Footprints className="h-4 w-4 text-[#4C7DF0]" /> Sales Representative
        Summary
      </h2>
      <DataTableShell
        columnCount={9}
        loading={loading}
        isEmpty={!loading && total === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No sales rep data"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Sales Rep</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Leads</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Calls</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Visits</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Follow-up Completed</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Follow-up Due</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Follow-up Overdue</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Follow-up Upcoming</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Latest Disposition</TableHead>
          </TableRow>
        }
      >
        {sales.map((r, i) => (
          <TableRow key={`${r.name ?? ""}-${i}`} className={TABLE_ROW_CLASS}>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell className="font-semibold">{r.total_lead ?? 0}</TableCell>
            <TableCell>{r.total_call ?? 0}</TableCell>
            <TableCell>{r.total_visit ?? 0}</TableCell>
            <TableCell>{r.followup_completed ?? 0}</TableCell>
            <TableCell>{r.followup_due ?? 0}</TableCell>
            <TableCell>{r.followup_overdue ?? 0}</TableCell>
            <TableCell>{r.followup_upcoming ?? 0}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {String(r.latest_disposition ?? "—")}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}

// ─── Disposition details table ─────────────────────────────────────────────

interface DispTableProps {
  rows: DispositionRow[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  loading: boolean;
}

function DispositionTable({
  rows,
  page,
  totalPages,
  total,
  onPageChange,
  loading,
}: DispTableProps) {
  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Info className="h-4 w-4 text-[#4C7DF0]" /> Disposition Details
      </h2>
      <DataTableShell
        columnCount={9}
        loading={loading}
        isEmpty={!loading && total === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No disposition entries"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Sales Rep</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Action</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Feedback</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Location</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Remarks</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow
            key={`${r.loan_code ?? r.lead_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell>{r.username ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-[10px]">
                {r.loan_code ?? r.lead_code ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{r.lead_name ?? "—"}</TableCell>
            <TableCell>{capitalize(r.activity_type)}</TableCell>
            <TableCell>
              <Badge className="bg-indigo-50 text-indigo-700 text-[10px] uppercase">
                {capitalize(r.outcome)}
              </Badge>
            </TableCell>
            <TableCell>{capitalize(r.feedback) || "-"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.created_at)}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              <MapPin className="mr-1 inline h-3 w-3 text-slate-400" />
              {r.address ?? "—"}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {capitalize(r.remark)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
