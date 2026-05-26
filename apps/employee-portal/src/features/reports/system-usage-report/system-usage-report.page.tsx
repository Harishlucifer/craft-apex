import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Inbox,
  LineChart as LineChartIcon,
  Smartphone,
} from "lucide-react";
import {
  Badge,
  Button,
  Label,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
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
import {
  usePlatformLookup,
  useRevertUserAccount,
  useSystemUsageReport,
} from "./system-usage-report.api";
import {
  formatLabel,
  type LinePortalSeries,
  type PlatformChartPoint,
  type UsageCard,
  type UsageReportFilter,
  type UsageRow,
} from "./system-usage-report.types";

const PAGE_SIZE = 10;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

function fmtDate(v?: string): string {
  if (!v) return "N/A";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  // Legacy `formattedDate` (utility.js line 132) → DD-MM-YYYY.
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function SystemUsageReportPage() {
  const dateRange = useDateRange();
  const [platform, setPlatform] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<UsageReportFilter>({});
  const [page, setPage] = useState(1);

  const { data, isFetching } = useSystemUsageReport(appliedFilter);
  const { data: platforms = [] } = usePlatformLookup();
  const revert = useRevertUserAccount();

  const rows = data?.usage_data ?? [];
  const cards = data?.dashboard ?? [];
  const platformChart = data?.platform_chart ?? [];
  const lineChart = data?.line_chart ?? [];

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const apply = () => {
    setAppliedFilter({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
      platform: platform || undefined,
    });
    setPage(1);
  };

  const reset = () => {
    dateRange.reset();
    setPlatform("");
    setAppliedFilter({});
    setPage(1);
  };

  const handleRevert = (row: UsageRow) => {
    if (row.user_id == null || !row.platform) return;
    revert.mutate(
      { user_id: row.user_id, platform: row.platform },
      {
        onSuccess: (response: any) => {
          if (response?.data?.error) {
            toast.error(String(response.data.error));
            return;
          }
          toast.success("The account has been unlocked successfully");
          // Re-trigger by bumping the applied filter reference.
          setAppliedFilter((f) => ({ ...f }));
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Failed to revert account");
        },
      }
    );
  };

  return (
    <ReportShell
      title="Platform Usage Report"
      description={`${rows.length} ${rows.length === 1 ? "user" : "users"}`}
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      headerExtras={
        <div className="space-y-4">
          {cards.length > 0 && <DashboardCards cards={cards.slice().reverse()} />}
          {(platformChart.length > 0 || lineChart.length > 0) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartCard
                icon={<BarChart3 className="h-4 w-4 text-emerald-600" />}
                title="Platform Activity"
              >
                <PlatformBarSummary data={platformChart} />
              </ChartCard>
              <ChartCard
                icon={<LineChartIcon className="h-4 w-4 text-sky-600" />}
                title="Activity Trend"
              >
                <LineSeriesSummary data={lineChart} />
              </ChartCard>
            </div>
          )}
        </div>
      }
      filters={
        <>
          <DateRangeFields
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartChange={dateRange.setStartDate}
            onEndChange={dateRange.setEndDate}
          />
          <div className="space-y-1.5">
            <Label
              htmlFor="usage-platform"
              className="flex items-center gap-1 text-xs font-medium text-slate-700"
            >
              <Smartphone className="h-3 w-3" /> Platform
            </Label>
            <select
              id="usage-platform"
              className={selectClass}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="">All</option>
              {platforms.map((p) => (
                <option key={p.lu_key} value={p.lu_key}>
                  {p.lu_name}
                </option>
              ))}
            </select>
          </div>
        </>
      }
    >
      <DataTableShell
        columnCount={10}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No usage data"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>User Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Mobile</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>E-mail</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>User Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Activity</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Platform</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Total Usage</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Account status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Recent Login</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created At</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow
            key={`${String(r.user_id ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.user_name ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.mobile ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-600">
              {r.email ?? "—"}
            </TableCell>
            <TableCell>{r.user_type ?? "—"}</TableCell>
            <TableCell>
              {r.activity ? (
                <Badge variant="secondary">{r.activity}</Badge>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>{r.platform ?? "—"}</TableCell>
            <TableCell className="font-semibold text-slate-900">
              {r.usage_count ?? 0}
            </TableCell>
            <TableCell>
              {r.user_account_frozen ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revert.isPending}
                  onClick={() => handleRevert(r)}
                >
                  Revert Lock
                </Button>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.recent_login)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

function DashboardCards({ cards }: { cards: UsageCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <div
          key={`${card.label ?? i}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {formatLabel(card.label)}
            </p>
            <span className="rounded-md bg-sky-50 p-2 text-sky-700">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {String(card.value ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

/**
 * Tabular summary of legacy BarChart.js. ApexCharts isn't part of the apex
 * stack yet, so we mirror the data shape without the chart widget.
 */
function PlatformBarSummary({ data }: { data: PlatformChartPoint[] }) {
  if (data.length === 0) {
    return <p className="text-xs text-slate-400">No platform data.</p>;
  }
  const max = Math.max(
    ...data.map((d) => Number(d.value ?? 0) || 0),
    1
  );
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const value = Number(d.value ?? 0) || 0;
        const pct = Math.min(100, Math.round((value / max) * 100));
        return (
          <div key={`${d.label ?? i}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{d.label ?? "—"}</span>
              <span className="font-mono text-slate-800">{value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tabular summary of legacy LineChart.js (per-portal series).
 */
function LineSeriesSummary({ data }: { data: LinePortalSeries[] }) {
  if (data.length === 0) {
    return <p className="text-xs text-slate-400">No trend data.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((series, i) => {
        const total = (series.list ?? []).reduce(
          (sum, p) => sum + (Number(p.value ?? 0) || 0),
          0
        );
        return (
          <div
            key={`${series.portal ?? i}`}
            className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-sm font-medium text-slate-700">
              {series.portal ?? "—"}
            </span>
            <span className="font-mono text-xs text-slate-500">
              {(series.list ?? []).length} points · total {total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
