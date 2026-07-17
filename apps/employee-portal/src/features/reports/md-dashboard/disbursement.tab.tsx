import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  DISB_CARDS,
  MONTHLY_DISB,
  ACHIEVEMENT,
  FY_TREND,
  AUM_TREND,
  BUS_PORTFOLIO,
  DISB_SUMMARY,
} from "./disbursement.data";

const NAVY = "#1E2A6B";
const PURPLE = "#A78BFA";
const ORANGE = "#F59E0B";
const GREEN = "#34D399";
const GREEN_HIT = "#22C55E";
const GRAY = "#94A3B8";

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {right && <span className="text-[11px] text-slate-400">{right}</span>}
      </div>
      {children}
    </div>
  );
}

export function DisbursementTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {DISB_CARDS.map((c) => (
          <div
            key={c.key}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.accent}55)` }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {c.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{c.value}</p>
            <p
              className="mt-1 text-[11px] font-medium"
              style={{ color: c.accent }}
            >
              {c.note}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">{c.sub}</p>
            {c.bar > 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.bar}%`, backgroundColor: c.accent }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monthly disbursement + Achievement */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Monthly Disbursement — Target vs Actual (₹L)" right="FY 25-26">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MONTHLY_DISB} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: GRAY }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}L`}
                domain={[0, 600]}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine
                y={450}
                stroke={ORANGE}
                strokeDasharray="4 4"
                label={{ value: "₹450L Revised Target", position: "right", fontSize: 9, fill: ORANGE }}
              />
              <Bar dataKey="original" name="Original Target" fill={PURPLE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="revised" name="Revised Target" fill={ORANGE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={GREEN} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Monthly Achievement % vs Revised Target" right="Each month — ₹450L">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ACHIEVEMENT} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={50} />
              <Tooltip />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18}>
                {ACHIEVEMENT.map((a, i) => (
                  <Cell key={i} fill={a.pct >= 100 ? GREEN_HIT : ORANGE} />
                ))}
                <LabelList
                  dataKey="pct"
                  position="insideRight"
                  formatter={(v: any) => `${v}%`}
                  style={{ fill: "#fff", fontSize: 10, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
            <span className="text-slate-500">YTD Achievement (Apr - Sep)</span>
            <span className="font-bold" style={{ color: ORANGE }}>
              92.7% · ₹2,502 / ₹2,700L
            </span>
          </div>
        </Panel>
      </div>

      {/* FY trend + AUM */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="FY 2024-25 vs FY 2025-26 — Monthly Trend" right="2 Lines — Actual vs Actual">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={FY_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} domain={[350, 560]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="fy2425" name="FY 2024-25" stroke={GRAY} strokeWidth={2} dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="fy2526" name="FY 2025-26" stroke={NAVY} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="AUM Trend — 3 FY Comparison (₹L)" right="FY 22-23 | 23-24 | 24-25 | 25-26">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={AUM_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[8500, 11500]} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
              <Tooltip />
              <Area type="monotone" dataKey="fy2223" name="FY 22-23" stroke="#BFDBFE" fill="#DBEAFE" fillOpacity={0.7} />
              <Area type="monotone" dataKey="fy2324" name="FY 23-24" stroke="#93C5FD" fill="#BFDBFE" fillOpacity={0.7} />
              <Area type="monotone" dataKey="fy2425" name="FY 24-25" stroke="#60A5FA" fill="#93C5FD" fillOpacity={0.6} />
              <Area type="monotone" dataKey="fy2526" name="FY 25-26" stroke={NAVY} fill={NAVY} fillOpacity={0.12} strokeWidth={2} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Bus Portfolio */}
      <Panel
        title="Bus Portfolio — 15% Sub-Target (₹L)"
        right="Target = 15% of month's actual disbursement — Contracts 5-7/mo"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={BUS_PORTFOLIO} barCategoryGap="35%" margin={{ bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={<ContractTick />} axisLine={false} tickLine={false} height={50} interval={0} />
            <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 80]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <ReferenceLine
              y={65}
              stroke="#7C3AED"
              strokeDasharray="4 4"
              label={{ value: "Target 15%", position: "right", fontSize: 9, fill: "#7C3AED" }}
            />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} barSize={90}>
              {BUS_PORTFOLIO.map((b, i) => (
                <Cell key={i} fill={b.above ? GREEN_HIT : "#8B5CF6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      {/* Summary table */}
      <Panel
        title="Disbursement Summary Table — FY 2025-26"
        right="Original target | Revised target | Actual | % point | Cumulative shortfall"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Month</th>
                <th className="py-2 font-semibold">Original Tgt (M)</th>
                <th className="py-2 font-semibold">Revised Tgt (M)</th>
                <th className="py-2 font-semibold">Actual (M)</th>
                <th className="py-2 font-semibold">vs Orig %</th>
                <th className="py-2 font-semibold">vs Rev %</th>
                <th className="py-2 font-semibold">NPR FY FS</th>
                <th className="py-2 font-semibold">AUM ATS (M)</th>
                <th className="py-2 font-semibold">Cum. Shortfall vs Orig</th>
              </tr>
            </thead>
            <tbody>
              {DISB_SUMMARY.map((r) => (
                <tr key={r.month} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.month}</td>
                  <td className="py-2.5 text-slate-600">{r.orig}</td>
                  <td className="py-2.5 text-slate-600">{r.revised}</td>
                  <td className="py-2.5 font-medium text-slate-800">{r.actual}</td>
                  <td className="py-2.5 font-semibold text-rose-500">{r.vsOrig}</td>
                  <td
                    className={`py-2.5 font-semibold ${r.vsRevTone === "good" ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {r.vsRev}
                  </td>
                  <td className="py-2.5 text-slate-600">{r.npr}</td>
                  <td className="py-2.5 text-slate-600">{r.ats}</td>
                  <td className="py-2.5 font-semibold text-rose-500">{r.shortfall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function ContractTick({ x, y, payload }: any) {
  const item = BUS_PORTFOLIO.find((b) => b.month === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" y={14} fontSize={11} fill="#94a3b8">
        {payload.value}
      </text>
      <text textAnchor="middle" y={30} fontSize={12} fontWeight={700} fill="#334155">
        {item?.contracts}
      </text>
      <text textAnchor="middle" y={42} fontSize={9} fill="#94a3b8">
        contracts
      </text>
    </g>
  );
}
