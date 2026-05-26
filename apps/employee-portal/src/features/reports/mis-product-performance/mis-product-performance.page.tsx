import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Coins, IndianRupee, Inbox, Users } from "lucide-react";
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
import { useProductPerformance } from "./mis-product-performance.api";
import type {
  DashboardCard,
  LoanAmountChartPoint,
  LoanTypeChartPoint,
  ProductPerformanceFilter,
  ProductPerformanceRow,
} from "./mis-product-performance.types";

const PAGE_SIZE = 10;

// Verbatim color palette from legacy DonutChart.js.
const DONUT_COLORS = [
  "#F09319",
  "#7ED4AD",
  "#3357FF",
  "#FF33A5",
  "#33FFF3",
  "#F3FF33",
  "#FF8C33",
  "#8C33FF",
  "#33FFA5",
  "#FF3333",
];

// Legacy LoanAmountChart bar series colors.
const BAR_COLORS = {
  loan_amount: "#17a673",
  sanctioned_amount: "#2e59d9",
  disbursed_amount: "#f6c23e",
};

function fmtINR(v: number | string | undefined): string {
  if (v == null || v === "") return "₹ 0";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function toLakh(v: number | string | undefined): string {
  // Legacy y-axis formatter: value / 100000 + "L"
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0L";
  return `${(n / 100000).toFixed(1)}L`;
}

export default function MisProductPerformancePage() {
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] =
    useState<ProductPerformanceFilter>({});
  const { data, isFetching } = useProductPerformance(appliedFilter);
  const rows: ProductPerformanceRow[] = data?.product_performance_data ?? [];
  const cards: DashboardCard[] = data?.dashboard ?? [];
  const amountChart: LoanAmountChartPoint[] = data?.loan_amount_chart ?? [];
  const typeChart: LoanTypeChartPoint[] = data?.loan_type_chart ?? [];
  // Legacy: totalLeads = dashboard[0].count
  const totalLeads = cards[0]?.count ?? 0;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
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
      title="Product Performance"
      description="MIS · Loan-type product mix and amount flow"
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      headerExtras={
        cards.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {cards.map((card, i) => (
              <div
                key={`${card.label ?? i}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {card.label ?? "—"}
                  </p>
                  <span
                    className={`rounded-md p-2 ${
                      i === 0
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {i === 0 ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <IndianRupee className="h-4 w-4" />
                    )}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {card.count != null
                    ? String(card.count)
                    : fmtINR(card.amount)}
                </p>
                {card.count != null && card.amount != null && (
                  <p className="text-xs text-slate-500">{fmtINR(card.amount)}</p>
                )}
              </div>
            ))}
          </div>
        )
      }
      filters={
        <DateRangeFields
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={dateRange.setStartDate}
          onEndChange={dateRange.setEndDate}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Loan Amount Status
          </h3>
          {amountChart.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
              No data available
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={amountChart}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={toLakh} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => fmtINR(v as number | string)}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "#cbd5e1",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="loan_amount"
                    name="Total Amount"
                    fill={BAR_COLORS.loan_amount}
                  />
                  <Bar
                    dataKey="sanctioned_amount"
                    name="Sanctioned Amount"
                    fill={BAR_COLORS.sanctioned_amount}
                  />
                  <Bar
                    dataKey="disbursed_amount"
                    name="Disbursed Amount"
                    fill={BAR_COLORS.disbursed_amount}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Loan Type Status
          </h3>
          {typeChart.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
              No data available
            </div>
          ) : (
            <div className="relative h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChart}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {typeChart.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-12">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Total Leads</div>
                  <div className="text-xl font-bold text-slate-800">
                    {String(totalLeads)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <DataTableShell
          columnCount={7}
          loading={isFetching && rows.length === 0}
          isEmpty={!isFetching && rows.length === 0}
          emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
          emptyTitle="No product data in this window"
          pagination={{
            page,
            totalPages,
            total: rows.length,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
          header={
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Leads</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Loan ₹</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Sanctioned</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Sanctioned ₹</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Disbursed</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Disbursed ₹</TableHead>
            </TableRow>
          }
        >
          {paged.map((r, i) => (
            <TableRow
              key={`${r.loan_type ?? ""}-${i}`}
              className={TABLE_ROW_CLASS}
            >
              <TableCell className="font-medium">
                <div>{r.loan_type ?? "—"}</div>
                {r.loan_category && (
                  <div className="text-xs text-slate-500">{r.loan_category}</div>
                )}
              </TableCell>
              <TableCell>{r.leads_count ?? "—"}</TableCell>
              <TableCell>{fmtINR(r.loan_amount)}</TableCell>
              <TableCell>{r.sanctioned_count ?? "—"}</TableCell>
              <TableCell>{fmtINR(r.sanctioned_amount)}</TableCell>
              <TableCell>{r.disbursed_count ?? "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-slate-400" />
                  {fmtINR(r.disbursed_amount)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </DataTableShell>
      </div>
    </ReportShell>
  );
}
