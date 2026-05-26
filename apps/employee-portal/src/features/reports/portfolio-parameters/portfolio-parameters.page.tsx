import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  RefreshCw,
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
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LEGACY_BRANCH_TARGETS,
  LEGACY_IRR_BY_PRODUCT,
  LEGACY_LTV_BUCKETS,
  LEGACY_LTV_BUCKET_COLORS,
  LEGACY_PORTFOLIO_KPIS,
} from "./portfolio-parameters.api";
import type { PortfolioKpi } from "./portfolio-parameters.types";

// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/PortfolioParameters.js
//
// LEGACY IS MOCK-ONLY. KPIs, the LTV bucket bar chart, the IRR-by-product
// table, and the branch-wise target/ATS table are all hard-coded in-
// component arrays. "Refresh" and "Export PDF" buttons render but have no
// onClick handlers.
//
// This page mirrors the legacy visuals verbatim against that mock data so
// the route renders identically. Once a backend exists, replace imports
// from portfolio-parameters.api with React Query hooks.

// DEFERRED:
//   - "Refresh" and "Export PDF" buttons (legacy has no handler).

const KPI_TONE: Record<PortfolioKpi["color"], string> = {
  primary: "border-t-indigo-500",
  success: "border-t-emerald-500",
  info: "border-t-sky-500",
  warning: "border-t-amber-500",
  danger: "border-t-rose-500",
};

export default function PortfolioParametersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Portfolio Parameters
          </h1>
          <p className="text-sm text-slate-500">
            LTV compliance · Weighted IRR · ATS tracking · Sep 2025.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Deferred — legacy has no handler"
          >
            <Download className="mr-1 h-4 w-4" /> Export PDF
          </Button>
          <Button
            size="sm"
            disabled
            title="Deferred — legacy has no handler"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
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
            Legacy is mock-only — no backend exists. KPI cards, the LTV
            bucket chart, IRR-by-product matrix and branch ATS table all
            render verbatim seed values from the legacy component and will
            be wired up once portfolio APIs ship.
          </p>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {LEGACY_PORTFOLIO_KPIS.map((kpi) => (
          <Card
            key={kpi.label}
            className={`border-t-4 shadow-sm ${KPI_TONE[kpi.color]}`}
          >
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {kpi.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* LTV bucket chart */}
        <Card className="border-0 shadow-sm xl:col-span-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              LTV Bucket Compliance
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Quarterly vs allowed limits
            </p>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={LEGACY_LTV_BUCKETS}>
                  <XAxis dataKey="bucket" fontSize={11} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {LEGACY_LTV_BUCKETS.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          LEGACY_LTV_BUCKET_COLORS[
                            i % LEGACY_LTV_BUCKET_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 border-t pt-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Target Goal</span>
                <span className="font-bold text-emerald-600">95.0%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: "92%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IRR by product table */}
        <Card className="border-0 shadow-sm xl:col-span-8">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  IRR by Product × Finance Type
                </h2>
                <p className="text-xs text-slate-500">
                  Weighted average gross IRR percentage
                </p>
              </div>
              <Badge className="bg-sky-100 text-sky-700">Avg. 18.2%</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead className="text-center">Refinance</TableHead>
                  <TableHead className="text-center">Used</TableHead>
                  <TableHead className="text-center">Takeover</TableHead>
                  <TableHead className="text-center">Avg LTV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEGACY_IRR_BY_PRODUCT.map((row) => (
                  <TableRow key={row.product}>
                    <TableCell className="font-bold">{row.product}</TableCell>
                    <TableCell
                      className={`text-center font-bold ${row.new === "—" ? "text-slate-400" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {row.new}
                    </TableCell>
                    <TableCell className="bg-amber-50 text-center font-bold text-amber-700">
                      {row.refinance}
                    </TableCell>
                    <TableCell className="bg-amber-50 text-center font-bold text-amber-700">
                      {row.used}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.takeover}
                    </TableCell>
                    <TableCell className="bg-slate-50 text-center font-bold text-indigo-700">
                      {row.avgLtv}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Branch targets */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Branch-wise Disbursement Targets &amp; ATS
              </h2>
              <p className="text-xs text-slate-500">
                Performance data for Fiscal Year 2025–26
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-[10px] uppercase text-slate-500">
                  Avg. Achievement
                </p>
                <p className="text-base font-bold text-emerald-600">88.2%</p>
              </div>
              <div className="border-l pl-6 text-center">
                <p className="text-[10px] uppercase text-slate-500">
                  Total Target
                </p>
                <p className="text-base font-bold text-slate-900">₹360L</p>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead className="text-center">Monthly Target</TableHead>
                <TableHead className="text-center">ATS (₹L)</TableHead>
                <TableHead className="text-center">Sep Actual</TableHead>
                <TableHead className="text-center">YTD Target</TableHead>
                <TableHead className="text-center">YTD Actual</TableHead>
                <TableHead>Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEGACY_BRANCH_TARGETS.map((row) => {
                const actualVal = parseFloat(row.actual);
                const actualTone =
                  actualVal > 60
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700";
                return (
                  <TableRow key={row.branch}>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-700">
                        {row.branch}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {row.target}
                    </TableCell>
                    <TableCell className="text-center text-slate-500">
                      {row.ats}
                    </TableCell>
                    <TableCell
                      className={`text-center font-bold ${actualTone}`}
                    >
                      {row.actual}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {row.ytdTarget}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {row.ytdActual}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: row.achievement }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          {row.achievement}
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
  );
}
