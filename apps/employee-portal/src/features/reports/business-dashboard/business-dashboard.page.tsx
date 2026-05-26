import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Download } from "lucide-react";
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
  LEGACY_BRANCH_PERFORMANCE,
  LEGACY_BUSINESS_KPIS,
  LEGACY_DEAL_REGISTER,
  LEGACY_FY_TREND,
  LEGACY_MONTHLY_TARGET,
} from "./business-dashboard.api";
import type { DealRow } from "./business-dashboard.types";

// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/BusinessDashboard.js
//
// LEGACY IS MOCK-ONLY. KPI cards, branch-performance table, Monthly-vs-
// Target bar chart, FY-trend line chart, and the 10-row Deal Register table
// are all in-component arrays. Filter dropdowns (Branch / Status / Type)
// render literal options with no useState; "Export" / "Export CSV" / "Clear"
// buttons have no onClick.
//
// This page mirrors those visuals verbatim against the mock data so the
// route renders identically. Once a backend exists, replace the imports
// from business-dashboard.api with React Query hooks.

// DEFERRED:
//   - Branch / Status / Type filter wiring (legacy has no state).
//   - Search box on Contract / Customer / Executive (legacy has no state).
//   - "Export" / "Export CSV" buttons (legacy has no handler).
//   - "View" action on deal rows (legacy renders a static Button).

const STATUS_TONE: Record<DealRow["status"], string> = {
  Disbursed: "bg-emerald-100 text-emerald-700",
  Approved: "bg-emerald-100 text-emerald-700",
  "In Process": "bg-amber-100 text-amber-700",
  "Deal Lost": "bg-rose-100 text-rose-700",
  Rejected: "bg-rose-100 text-rose-700",
};

export default function BusinessDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Daily disbursement tracker · Target vs Actual · IRR Summary · Sep
            2025.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Deferred — legacy has no handler"
          >
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Legacy is mock-only — no backend exists for KPIs, branch
            performance, chart series or the deal register. Filters and
            export buttons render but have no handlers. Numbers below are
            verbatim seed values from the legacy component.
          </p>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {LEGACY_BUSINESS_KPIS.map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {kpi.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {kpi.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Branch Performance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="border-0 shadow-sm xl:col-span-3">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Monthly vs Target
            </h2>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={LEGACY_MONTHLY_TARGET}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="target" name="Target" fill="#cbd5e1" />
                  <Bar dataKey="actual" name="Actual" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm xl:col-span-3">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                FY Trend (₹Cr)
              </h2>
              <span className="text-[10px] text-slate-500">
                2024–25 vs 2025–26
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={LEGACY_FY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="prev"
                    name="2024–25"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="2025–26"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm xl:col-span-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Branch Performance
              </h2>
              <span className="text-[10px] text-slate-500">Sep 2025</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-center">Target</TableHead>
                  <TableHead className="text-center">Disbursed</TableHead>
                  <TableHead className="text-center">Files</TableHead>
                  <TableHead>Achvmt.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEGACY_BRANCH_PERFORMANCE.map((row) => {
                  const tone =
                    row.tone === "good"
                      ? "text-indigo-600"
                      : "text-amber-600";
                  const pct = Math.min(100, parseInt(row.achvmt, 10));
                  return (
                    <TableRow key={row.branch}>
                      <TableCell>
                        <Badge className="bg-slate-100 text-indigo-700">
                          {row.branch}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.target}
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${tone}`}
                      >
                        {row.disbursed}
                      </TableCell>
                      <TableCell className="text-center text-slate-500">
                        {row.files}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full ${row.tone === "good" ? "bg-indigo-500" : "bg-amber-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${tone}`}
                            style={{ minWidth: 35 }}
                          >
                            {row.achvmt}
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
      </div>

      {/* Deal Register */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Deal Register — Sep 2025
            </h2>
            <span className="text-xs text-slate-500">
              {LEGACY_DEAL_REGISTER.length} records
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Contract No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Executive</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Finance Type</TableHead>
                <TableHead>Fin. Amt (₹)</TableHead>
                <TableHead>IRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proposal Dt.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEGACY_DEAL_REGISTER.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Badge className="bg-slate-100 text-indigo-700">
                      {row.branch}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.contractNo}</TableCell>
                  <TableCell className="font-semibold">
                    {row.customer}
                  </TableCell>
                  <TableCell>{row.executive}</TableCell>
                  <TableCell>{row.vehicle}</TableCell>
                  <TableCell>
                    <Badge className="bg-slate-100 text-slate-700 uppercase">
                      {row.financeType}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.irr}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_TONE[row.status]}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
