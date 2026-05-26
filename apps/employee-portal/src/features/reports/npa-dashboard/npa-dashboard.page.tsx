import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  Percent,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@craft-apex/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LEGACY_BRANCH_SUMMARY,
  LEGACY_NPA_ACCOUNTS,
  LEGACY_NPA_KPIS,
  LEGACY_NPA_SNAPSHOTS,
  LEGACY_NPA_TREND,
} from "./npa-dashboard.api";
import type { NpaKpi } from "./npa-dashboard.types";

// Legacy: craft-frontend/src/pages/Reports/NpaReports/NpaDashboard.js
//
// LEGACY IS MOCK-ONLY. KPIs, branch summary, NPA account rows, NPA trend
// and weekly-snapshot chart series are all in-component arrays in the
// legacy file. Filter selects (`branch`, `odBucket`) have local useState
// only and don't trigger any request. No endpoint exists in ApiEndPoint.js.
//
// This page mirrors the legacy visuals verbatim against that mock data so
// the route renders identically. Once a backend exists, replace imports
// from npa-dashboard.api with React Query hooks.

// DEFERRED:
//   - Branch / OD Bucket filter wiring (legacy has no request).
//   - Drill-down on contract / branch links (legacy renders cursor:pointer
//     spans with no onClick).

const KPI_ICONS: Record<NpaKpi["label"], React.ReactNode> = {
  "Total Portfolio": <Briefcase className="h-5 w-5" />,
  "Gross NPA": <TrendingUp className="h-5 w-5" />,
  "NPA Value": <IndianRupee className="h-5 w-5" />,
  "Provision Held": <ShieldCheck className="h-5 w-5" />,
  "Net NPA": <Percent className="h-5 w-5" />,
  "Recovery Rate": <RefreshCw className="h-5 w-5" />,
};

const KPI_TONE: Record<NpaKpi["color"], string> = {
  primary: "border-l-indigo-500 text-indigo-700",
  danger: "border-l-rose-500 text-rose-700",
  warning: "border-l-amber-500 text-amber-700",
  info: "border-l-sky-500 text-sky-700",
  secondary: "border-l-slate-500 text-slate-700",
  success: "border-l-emerald-500 text-emerald-700",
};

export default function NpaDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            NPA Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Gross/Net NPA, provision coverage, recovery and branch-level
            asset-quality snapshot.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Legacy is mock-only — no backend endpoint exists in
            <code className="mx-1 rounded bg-amber-100 px-1">ApiEndPoint.js</code>
            for this dashboard. The numbers below are the verbatim seed values
            from the legacy component and will be wired up when the NPA API
            ships.
          </p>
        </CardContent>
      </Card>

      {/* KPI cards — legacy: 6 cards in a single row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {LEGACY_NPA_KPIS.map((kpi) => (
          <Card
            key={kpi.label}
            className={`border-l-4 shadow-sm ${KPI_TONE[kpi.color]}`}
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </span>
                <span className="text-slate-400">
                  {KPI_ICONS[kpi.label] ?? null}
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className="mt-1 text-[11px] text-slate-500">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 5-Year NPA Trend */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                5-Year NPA Trend
              </h2>
              <span className="text-xs text-slate-500">Gross NPA %</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer>
                <LineChart data={LEGACY_NPA_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="grossNpaPct"
                    stroke="#f06548"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly snapshots */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Weekly Snapshots — 16th / 23rd / 30th Oct '25
              </h2>
            </div>
            <div className="h-60">
              <ResponsiveContainer>
                <BarChart data={LEGACY_NPA_SNAPSHOTS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="npaConts" name="NPA Conts." fill="#f06548" />
                  <Bar
                    dataKey="outstandingLakhs"
                    name="Outstanding (₹L)"
                    fill="#f7b84b"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch NPA Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Branch NPA Summary
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead className="text-center">NPA Conts.</TableHead>
                <TableHead>O/S (₹L)</TableHead>
                <TableHead>Portfolio</TableHead>
                <TableHead>Gross NPA %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEGACY_BRANCH_SUMMARY.map((row) => {
                const countTone =
                  row.npaConts >= 10
                    ? "text-rose-600"
                    : row.npaConts >= 7
                      ? "text-amber-600"
                      : "text-emerald-600";
                return (
                  <TableRow key={row.branch}>
                    <TableCell className="font-semibold text-indigo-600">
                      {row.branch}
                    </TableCell>
                    <TableCell className={`text-center font-bold ${countTone}`}>
                      {row.npaConts}
                    </TableCell>
                    <TableCell className="text-sm">{row.os}</TableCell>
                    <TableCell className="text-sm">{row.portfolio}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${row.barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-rose-600">
                          {row.grossNpa}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* NPA Accounts */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              NPA Accounts
            </h2>
            <span className="text-xs text-slate-500">
              {LEGACY_NPA_ACCOUNTS.length} records
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Contract No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>OD Bucket</TableHead>
                <TableHead>FA (₹)</TableHead>
                <TableHead>FC (₹)</TableHead>
                <TableHead>Future Recv. (₹)</TableHead>
                <TableHead>Outstanding (₹)</TableHead>
                <TableHead>Dmin Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEGACY_NPA_ACCOUNTS.map((row, idx) => (
                <TableRow key={row.contract}>
                  <TableCell>{String(idx + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="font-semibold text-indigo-600">
                    {row.branch}
                  </TableCell>
                  <TableCell>{row.contract}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell className="font-bold text-rose-600">
                    {row.odBucket}
                  </TableCell>
                  <TableCell>{row.fa}</TableCell>
                  <TableCell className="text-rose-600">{row.fc}</TableCell>
                  <TableCell>{row.futureRecv}</TableCell>
                  <TableCell>{row.outstanding}</TableCell>
                  <TableCell>{row.dminDate}</TableCell>
                  <TableCell>
                    <Badge className="bg-rose-100 text-rose-700">
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
