import { Fragment, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import {
  useEmployeeSearch,
  useGenerateTargetReport,
} from "./sales-performance-overview.api";
import type {
  EmployeeOption,
  MetricCell,
  SummaryCard as SummaryCardData,
  TargetReportResult,
} from "./sales-performance-overview.types";

// Legacy: craft-frontend/src/pages/TargetMgmt/TargetReport/index.js + SummaryCards.js
//         + DailyPerformance.js + WeeklyPerformance.js + MonthlyPerformance.js
//
// Filters: Employee (paginated search) + Month (yyyy-MM) — verbatim labels from legacy.
// On submit, POST EMPLOYEE_TARGET_REPORT with { employee_id, month, year }.
//
// Deferred items:
//   - Export buttons (Daily/Weekly/Monthly) — legacy uses EMPLOYEE_TARGETS_EXPORT
//     but that block is commented out in the legacy file. Buttons hidden here.
//   - DropdownWithPagination autosearch — replaced by Input + paged employee list.

// --- helpers (verbatim from legacy index.js) ---

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthName(month?: string | number, year?: string | number) {
  if (!month) return "";
  const idx = parseInt(String(month), 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return "";
  return `${MONTH_NAMES[idx]} ${year ?? ""}`.trim();
}

function formatIndianCurrency(num: number | string | undefined | null): string {
  if (num === null || num === undefined) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (Number.isNaN(n)) return "0";
  const r = Math.round(n);
  const s = Math.abs(r).toString();
  const last3 = s.substring(s.length - 3);
  const rest = s.substring(0, s.length - 3);
  const formatted =
    rest !== ""
      ? rest.replace(/\B(?=(?:\d{2})+(?!\d))/g, ",") + "," + last3
      : last3;
  return r < 0 ? `-${formatted}` : formatted;
}

function formatValue(value: number | string | undefined, type?: string) {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "-";
  const r = Math.round(n);
  if (type === "AMOUNT") return "₹" + formatIndianCurrency(r);
  return r.toString();
}

function capitalizeWords(str?: string): string {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Legacy deduplicateSummaryCards (index.js): when an attribute repeats across
// periods, keep the highest priority (YEARLY > MONTHLY > WEEKLY > DAILY).
function deduplicateSummaryCards(cards: SummaryCardData[] | undefined): SummaryCardData[] {
  if (!cards || !Array.isArray(cards)) return [];
  const priority: Record<string, number> = {
    YEARLY: 4, MONTHLY: 3, WEEKLY: 2, DAILY: 1,
  };
  const out: Record<string, SummaryCardData> = {};
  cards.forEach((card) => {
    const key = card?.target_attribute;
    if (!key) return;
    const cur = priority[card?.target_period ?? ""] ?? 0;
    const prev = out[key] ? (priority[out[key]!.target_period ?? ""] ?? 0) : -1;
    if (cur > prev) out[key] = card;
  });
  return Object.values(out);
}

// Today's yyyy-MM
function defaultMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// --- page ---

export default function SalesPerformanceOverviewPage() {
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);
  const [employeeKeyword, setEmployeeKeyword] = useState("");
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [month, setMonth] = useState<string>(defaultMonth);
  const [error, setError] = useState<string>("");

  const { data: employeeList = [] } = useEmployeeSearch(employeeKeyword, 1);
  const generate = useGenerateTargetReport();
  const reportData: TargetReportResult | null | undefined = generate.data;

  const [yearStr, monthStr] = month ? month.split("-") : ["", ""];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) {
      setError("Please select an employee");
      return;
    }
    if (!month) {
      setError("Please select a month");
      return;
    }
    setError("");
    generate.mutate({
      employee_id: employee.employee_id,
      month: monthStr ?? "",
      year: yearStr ?? "",
    });
  };

  const summaryCards = useMemo(
    () => deduplicateSummaryCards(reportData?.summary_cards),
    [reportData],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sales Performance Overview
        </h1>
        <p className="text-sm text-slate-500">
          Daily, weekly, and monthly target achievement for a sales employee.
        </p>
      </div>

      {/* Filters (verbatim from legacy: Employee + Month + Generate Report). */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label>
                Select Employee <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={
                    employee
                      ? `${employee.name ?? ""}${
                          employee.employee_code ? ` (${employee.employee_code})` : ""
                        }`
                      : employeeKeyword
                  }
                  onChange={(e) => {
                    setEmployee(null);
                    setEmployeeKeyword(e.target.value);
                    setEmployeeOpen(true);
                  }}
                  onFocus={() => setEmployeeOpen(true)}
                  placeholder="Search Employee"
                />
                {employeeOpen && employeeList.length > 0 && !employee && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow">
                    {employeeList.map((emp) => (
                      <button
                        key={String(emp.employee_id)}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                        onClick={() => {
                          setEmployee(emp);
                          setEmployeeKeyword("");
                          setEmployeeOpen(false);
                        }}
                      >
                        {emp.name}
                        {emp.employee_code ? ` (${emp.employee_code})` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>
                Select Month <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={generate.isPending}
                className="w-full"
              >
                {generate.isPending ? "Loading…" : "Generate Report"}
              </Button>
            </div>

            {error && (
              <div className="md:col-span-3 text-sm text-rose-600">{error}</div>
            )}
            {generate.isError && (
              <div className="md:col-span-3 text-sm text-rose-600">
                Failed to generate report. Please try again.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Report content */}
      {reportData ? (
        <>
          <SummaryCards summaryCards={summaryCards} />
          <DailyPerformanceTable
            dailyData={reportData.daily_performance}
            month={monthStr}
            year={yearStr}
          />
          <WeeklyPerformanceTable
            weeklyData={reportData.weekly_performance}
            month={monthStr}
            year={yearStr}
          />
          <MonthlyPerformanceTable
            monthlyData={reportData.monthly_performance}
            month={monthStr}
            year={yearStr}
          />
        </>
      ) : (
        !generate.isPending && (
          <Card>
            <CardContent className="py-12 text-center">
              <Inbox className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-medium text-slate-700">
                No Report Generated
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Please select an employee and month, then click "Generate Report"
                to view the performance data.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

// --- Summary cards (verbatim labels from legacy SummaryCards.js) ---

function SummaryCards({ summaryCards }: { summaryCards: SummaryCardData[] }) {
  if (!summaryCards.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.slice(0, 4).map((card, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.target_attribute ? capitalizeWords(card.target_attribute) : "N/A"}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {formatValue(card.achieved_value, card.target_type)} /{" "}
              {formatValue(card.target_value, card.target_type)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {card.achieved_percentage_str ?? "0%"} Achievement
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- Daily perf (verbatim header layout from legacy DailyPerformance.js) ---

interface PerfProps {
  month?: string;
  year?: string;
}

function DailyPerformanceTable({
  dailyData,
  month,
  year,
}: PerfProps & { dailyData?: TargetReportResult["daily_performance"] }) {
  const metrics: MetricCell[] = dailyData?.metrics ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-sky-500 pb-2">
        <CardTitle className="text-base font-semibold text-sky-700">
          DAILY PERFORMANCE -{" "}
          {getMonthName(dailyData?.month ?? month, dailyData?.year ?? year)}
        </CardTitle>
        {!metrics.length && (
          <Badge className="bg-amber-100 text-amber-800">No Targets Configured</Badge>
        )}
      </CardHeader>
      <CardContent>
        {!metrics.length ? (
          <div className="py-4 text-center text-sm text-slate-500">
            No daily targets have been configured for this employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th rowSpan={2} className="border px-2 py-1 text-center font-semibold">
                    Date
                  </th>
                  <th rowSpan={2} className="border px-2 py-1 text-center font-semibold">
                    Day
                  </th>
                  {metrics.map((m, i) => (
                    <th key={i} colSpan={4} className="border px-2 py-1 text-center font-bold">
                      {m.target_attribute ? capitalizeWords(m.target_attribute) : "N/A"}
                      <Badge
                        className={`ml-2 ${
                          m.target_type === "AMOUNT"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {m.target_type ?? "N/A"}
                      </Badge>
                    </th>
                  ))}
                </tr>
                <tr>
                  {metrics.map((_, i) => (
                    <Fragment key={i}>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Target
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Achieved
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Var
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        %
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyData?.daily_data?.map((day, di) => (
                  <tr
                    key={di}
                    className={[
                      day.is_today ? "bg-amber-50" : "",
                      day.is_future ? "bg-slate-100 text-slate-400" : "",
                    ].join(" ")}
                  >
                    <td className="border px-2 py-1 text-center font-medium">
                      {String(day.day_number ?? "").padStart(2, "0")}
                      {day.is_today && (
                        <Badge className="ml-2 bg-sky-100 text-sky-700">TODAY</Badge>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-center">{day.day ?? ""}</td>
                    {day.metrics?.map((m, mi) => (
                      <MetricCells key={mi} m={m} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />≥100%</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />70-99%</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />&lt;70%</span>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Weekly perf ---

function WeeklyPerformanceTable({
  weeklyData,
  month,
  year,
}: PerfProps & { weeklyData?: TargetReportResult["weekly_performance"] }) {
  const metrics: MetricCell[] = weeklyData?.metrics ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-sky-500 pb-2">
        <CardTitle className="text-base font-semibold text-sky-700">
          WEEKLY PERFORMANCE -{" "}
          {getMonthName(weeklyData?.month ?? month, weeklyData?.year ?? year)}
        </CardTitle>
        {!metrics.length && (
          <Badge className="bg-amber-100 text-amber-800">No Targets Configured</Badge>
        )}
      </CardHeader>
      <CardContent>
        {!metrics.length ? (
          <div className="py-4 text-center text-sm text-slate-500">
            No weekly targets have been configured for this employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th rowSpan={2} className="border px-2 py-1 text-center font-semibold">
                    Week
                  </th>
                  <th rowSpan={2} className="border px-2 py-1 text-center font-semibold">
                    Date Range
                  </th>
                  {metrics.map((m, i) => (
                    <th key={i} colSpan={4} className="border px-2 py-1 text-center font-bold">
                      {m.target_attribute ? capitalizeWords(m.target_attribute) : "N/A"}
                      <Badge
                        className={`ml-2 ${
                          m.target_type === "AMOUNT"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {m.target_type ?? "N/A"}
                      </Badge>
                    </th>
                  ))}
                </tr>
                <tr>
                  {metrics.map((_, i) => (
                    <Fragment key={i}>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Target
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Achieved
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        Var
                      </th>
                      <th className="border bg-slate-50 px-2 py-1 text-center text-xs font-semibold">
                        %
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyData?.weekly_data?.map((wk, wi) => (
                  <tr
                    key={wi}
                    className={[
                      wk.is_wtd ? "bg-amber-50" : "",
                      wk.is_future ? "bg-slate-100 text-slate-400" : "",
                    ].join(" ")}
                  >
                    <td className="border px-2 py-1 text-center font-medium">
                      {wk.week_label ?? ""}
                      {wk.is_wtd && (
                        <Badge className="ml-2 bg-sky-100 text-sky-700">WTD</Badge>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {wk.date_range ?? ""}
                    </td>
                    {wk.metrics?.map((m, mi) => (
                      <MetricCells key={mi} m={m} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-xs text-slate-500">
          WTD = Week to Date (Current week in progress)
        </div>
      </CardContent>
    </Card>
  );
}

// --- Monthly perf (single table — verbatim headers from MonthlyPerformance.js) ---

function MonthlyPerformanceTable({
  monthlyData,
  month,
  year,
}: PerfProps & { monthlyData?: TargetReportResult["monthly_performance"] }) {
  const metrics: MetricCell[] = monthlyData?.metrics ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-sky-500 pb-2">
        <CardTitle className="text-base font-semibold text-sky-700">
          MONTHLY PERFORMANCE -{" "}
          {getMonthName(monthlyData?.month ?? month, monthlyData?.year ?? year)}
          {" "}(MTD - {String(monthlyData?.mtd_days ?? "0")} Days)
        </CardTitle>
        {!metrics.length && (
          <Badge className="bg-amber-100 text-amber-800">No Targets Configured</Badge>
        )}
      </CardHeader>
      <CardContent>
        {!metrics.length ? (
          <div className="py-4 text-center text-sm text-slate-500">
            No monthly targets have been configured for this employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border px-2 py-1 text-center font-bold">Metric</th>
                  <th className="border px-2 py-1 text-center font-bold">Type</th>
                  <th className="border px-2 py-1 text-center font-bold">Target</th>
                  <th className="border px-2 py-1 text-center font-bold">Achieved</th>
                  <th className="border px-2 py-1 text-center font-bold">Variance</th>
                  <th className="border px-2 py-1 text-center font-bold">Achievement %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => {
                  const target = Number(m.target_value ?? 0);
                  const achieved = Number(m.achieved_value ?? 0);
                  const variance = Number(m.variation_value ?? 0);
                  const pct = parseFloat(m.achieved_percentage_str ?? "0");
                  return (
                    <tr key={i}>
                      <td className="border px-2 py-1 font-medium">
                        {m.target_attribute ? capitalizeWords(m.target_attribute) : "N/A"}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <Badge
                          className={
                            m.target_type === "AMOUNT"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-indigo-100 text-indigo-700"
                          }
                        >
                          {m.target_type ?? "N/A"}
                        </Badge>
                      </td>
                      <td className="border px-2 py-1 text-center font-semibold text-sky-700">
                        {Math.round(target)}
                      </td>
                      <td
                        className={`border px-2 py-1 text-center font-semibold ${
                          achieved < 0
                            ? "text-rose-600"
                            : achieved > 0
                              ? "text-emerald-600"
                              : ""
                        }`}
                      >
                        {achieved > 0 ? "+" : ""}
                        {Math.round(achieved)}
                      </td>
                      <td
                        className={`border px-2 py-1 text-center font-semibold ${
                          variance < 0
                            ? "text-rose-600"
                            : variance > 0
                              ? "text-emerald-600"
                              : ""
                        }`}
                      >
                        {variance > 0 ? "+" : ""}
                        {Math.round(variance)}
                      </td>
                      <td
                        className={`border px-2 py-1 text-center font-semibold ${
                          pct < 0
                            ? "text-rose-600"
                            : pct > 0
                              ? "text-emerald-600"
                              : ""
                        }`}
                      >
                        {pct > 0 ? "+" : ""}
                        {m.achieved_percentage_str ?? "0%"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-xs text-slate-500">MTD = Month to Date</div>
      </CardContent>
    </Card>
  );
}

// Shared cells for Daily/Weekly metric columns.
function MetricCells({ m }: { m: MetricCell }) {
  const target = Number(m.target_value ?? 0);
  const achieved = Number(m.achieved_value ?? 0);
  const variance = Number(m.variation_value ?? 0);
  const pct = parseFloat(m.achieved_percentage_str ?? "0");
  return (
    <>
      <td className="border px-2 py-1 text-center font-semibold text-sky-700">
        {Math.round(target)}
      </td>
      <td
        className={`border px-2 py-1 text-center font-semibold ${
          achieved < 0 ? "text-rose-600" : achieved > 0 ? "text-emerald-600" : ""
        }`}
      >
        {achieved > 0 ? "+" : ""}
        {Math.round(achieved)}
      </td>
      <td
        className={`border px-2 py-1 text-center font-semibold ${
          variance < 0 ? "text-rose-600" : variance > 0 ? "text-emerald-600" : ""
        }`}
      >
        {variance > 0 ? "+" : ""}
        {Math.round(variance)}
      </td>
      <td
        className={`border px-2 py-1 text-center font-semibold ${
          pct < 0 ? "text-rose-600" : pct > 0 ? "text-emerald-600" : ""
        }`}
      >
        {pct > 0 ? "+" : ""}
        {m.achieved_percentage_str ?? "0%"}
      </td>
    </>
  );
}
