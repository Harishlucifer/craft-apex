import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileWarning } from "lucide-react";
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
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LEGACY_AGING_BY_DOC,
  LEGACY_BRANCH_GAP,
  LEGACY_DOC_SPLIT,
  LEGACY_PDD_CASES,
  LEGACY_PDD_KPIS,
  LEGACY_PRODUCT_TABS,
} from "./pdd-dashboard.api";
import type { PddCaseRow } from "./pdd-dashboard.types";

// Legacy: craft-frontend/src/pages/Reports/PddReports/PddDashBoard.js
//
// LEGACY IS PARTIAL MOCK. The product-tab list comes from LOAN_TYPE_MASTER
// in legacy (counts are filled by Math.random per a legacy comment).
// Everything else — KPIs, branch heatmap, donut + aging stack series, and
// the 10-row case table — is in-component arrays.
//
// In the new portal we treat the whole page as mock-only because the
// shared loan-type hook isn't wired up yet. The visuals are preserved
// verbatim against the legacy seed data.

// DEFERRED:
//   - Wire LOAN_TYPE_MASTER for the product-tab list (legacy has it).
//   - Branch / Doc Type / Aging / Status filter selects (legacy renders
//     local useState but doesn't filter anything).
//   - "Update" action button on case rows (legacy renders a static Button).

const AGING_TONE: Record<PddCaseRow["agingLabel"], string> = {
  Critical: "bg-rose-100 text-rose-700",
  Warning: "bg-amber-100 text-amber-700",
  OK: "bg-emerald-100 text-emerald-700",
};

const AGING_TEXT: Record<PddCaseRow["agingLabel"], string> = {
  Critical: "text-rose-600",
  Warning: "text-amber-600",
  OK: "text-emerald-600",
};

const KPI_TONE_BORDER: Record<"danger" | "warning", string> = {
  danger: "border-l-rose-500",
  warning: "border-l-amber-500",
};

export default function PddDashboardPage() {
  const [activeProduct, setActiveProduct] = useState<string>(
    LEGACY_PRODUCT_TABS[0]?.name ?? "",
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PDD Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Post-disbursement document tracking — Invoice / RC / Veh. Ins. /
            PDC pendency by branch &amp; aging bucket.
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
            Legacy is mostly mock-only — only the product-tab list pulls
            from <code className="mx-1 rounded bg-amber-100 px-1">LOAN_TYPE_MASTER</code>
            in legacy (with random placeholder counts). KPIs, the branch
            heatmap, charts and case rows are all in-component arrays.
            Wiring deferred until PDD APIs ship.
          </p>
        </CardContent>
      </Card>

      {/* Product tabs */}
      <div className="flex flex-wrap gap-2">
        {LEGACY_PRODUCT_TABS.map((p) => (
          <Button
            key={p.id}
            variant={activeProduct === p.name ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveProduct(p.name)}
          >
            {p.name}{" "}
            <Badge className="ml-2 bg-white/30 text-current">{p.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Aging threshold alert */}
      <Card className="border-amber-200 border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="flex items-center gap-3 p-3 text-sm">
          <FileWarning className="h-4 w-4 text-amber-600" />
          <span>
            <strong>Aging thresholds for {activeProduct}:</strong>{" "}
            <span className="font-semibold text-rose-600">
              ● Critical: &gt;90 days
            </span>{" "}
            <span className="font-semibold text-amber-600">
              ● Warning: 60–90 days
            </span>{" "}
            <span className="font-semibold text-emerald-600">
              ● OK: &lt;60 days
            </span>
          </span>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {LEGACY_PDD_KPIS.map((kpi) => (
          <Card
            key={kpi.label}
            className={`border-l-4 shadow-sm ${KPI_TONE_BORDER[kpi.tone]}`}
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

      {/* Charts + heatmap */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="border-0 shadow-sm xl:col-span-3">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Doc Type Split
            </h2>
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={LEGACY_DOC_SPLIT}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={45}
                    outerRadius={70}
                  >
                    {LEGACY_DOC_SPLIT.map((d) => (
                      <Cell key={d.label} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {LEGACY_DOC_SPLIT.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: d.color }}
                    />
                    {d.label}
                  </span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm xl:col-span-4">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Aging by Doc Type
            </h2>
            <div className="h-60">
              <ResponsiveContainer>
                <BarChart data={LEGACY_AGING_BY_DOC}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="docType" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="critical"
                    name="Critical"
                    stackId="a"
                    fill="#f06548"
                  />
                  <Bar
                    dataKey="warning"
                    name="Warning"
                    stackId="a"
                    fill="#f7b84b"
                  />
                  <Bar
                    dataKey="ok"
                    name="OK"
                    stackId="a"
                    fill="#0ab39c"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm xl:col-span-5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Branch-wise Document Gap
              </h2>
              <span className="text-xs text-slate-500">
                Heatmap · pending count per doc type
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-center">Invoice</TableHead>
                  <TableHead className="text-center">RC</TableHead>
                  <TableHead className="text-center">Veh. Ins.</TableHead>
                  <TableHead className="text-center">PDC</TableHead>
                  <TableHead>Aging Mix</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEGACY_BRANCH_GAP.map((row) => (
                  <TableRow key={row.branch}>
                    <TableCell className="font-semibold text-indigo-600">
                      {row.branch}
                    </TableCell>
                    <CountCell value={row.invoice} bg="#fff3cd" />
                    <CountCell value={row.rc} bg="#d1f2eb" />
                    <CountCell value={row.vehIns} bg="#fde8e8" />
                    <CountCell value={row.pdc} bg="#e8f4fd" />
                    <TableCell>
                      <div
                        className="flex h-2 w-20 overflow-hidden rounded"
                      >
                        <div
                          style={{
                            width: `${row.agingMix[0]}%`,
                            background: "#f06548",
                          }}
                        />
                        <div
                          style={{
                            width: `${row.agingMix[1]}%`,
                            background: "#f7b84b",
                          }}
                        />
                        <div
                          style={{
                            width: `${row.agingMix[2]}%`,
                            background: "#0ab39c",
                          }}
                        />
                      </div>
                    </TableCell>
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

      {/* PDD Cases */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              PDD Cases
            </h2>
            <span className="text-xs text-slate-500">
              {LEGACY_PDD_CASES.length} records
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
                <TableHead>Doc Type</TableHead>
                <TableHead>Aging (Days)</TableHead>
                <TableHead>Aging Status</TableHead>
                <TableHead>Disb. Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEGACY_PDD_CASES.map((row, idx) => (
                <TableRow key={row.contract}>
                  <TableCell>{String(idx + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="font-semibold text-indigo-600">
                    {row.branch}
                  </TableCell>
                  <TableCell>{row.contract}</TableCell>
                  <TableCell className="font-semibold">
                    {row.customer}
                  </TableCell>
                  <TableCell>{row.executive}</TableCell>
                  <TableCell>
                    <Badge className="bg-indigo-50 text-indigo-700">
                      {row.docType}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`font-bold ${AGING_TEXT[row.agingLabel]}`}
                  >
                    {row.aging}
                  </TableCell>
                  <TableCell>
                    <Badge className={AGING_TONE[row.agingLabel]}>
                      {row.agingLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.disbDate}</TableCell>
                  <TableCell>{row.vehicle}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        row.status === "Received"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }
                    >
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

function CountCell({
  value,
  bg,
}: {
  value: number | null;
  bg: string;
}) {
  if (value == null) {
    return (
      <TableCell className="text-center text-slate-400">—</TableCell>
    );
  }
  return (
    <TableCell className="text-center">
      <span
        className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-slate-800"
        style={{ background: bg }}
      >
        {value}
      </span>
    </TableCell>
  );
}
