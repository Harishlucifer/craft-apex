import {
  ResponsiveContainer,
  ComposedChart,
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
  PieChart,
  Pie,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import {
  COLL_CARDS,
  COLL_MONTHLY,
  COLL_TARGET,
  DEMAND_COLLECTED,
  COLL_BUCKETS,
  BRANCH_COLL,
  MODE_MIX,
  NIL_TREND,
  NIL_TARGET,
  COLL_TABLE,
} from "./collection.data";

const BLUE = "#2563EB";
const GREEN = "#10B981";
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

const TONE: Record<string, string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-rose-500",
};

export function CollectionTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {COLL_CARDS.map((c) => (
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
            <p className="mt-1 text-[11px] font-medium" style={{ color: c.accent }}>
              {c.note}
            </p>
          </div>
        ))}
      </div>

      {/* Collection % trend + Demand vs Collected */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Monthly Collection % vs Target" right="Target 65%">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={COLL_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <ReferenceLine y={COLL_TARGET} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Target 65%", position: "right", fontSize: 9, fill: "#EF4444" }} />
              <Bar dataKey="pct" fill={BLUE} radius={[4, 4, 0, 0]} barSize={42}>
                <LabelList dataKey="pct" position="top" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Demand vs Collected (₹L)" right="Apr – Sep'25">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DEMAND_COLLECTED} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="demand" name="Demand" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill={GREEN} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Bucket recovery + Branch collection */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Bucket-wise Recovery — Sep'25" right="Demand vs Collection">
          <div className="space-y-3 pt-1">
            {COLL_BUCKETS.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">{b.label}</span>
                  <span className="text-slate-400">
                    {b.nos} nos · {b.demand} demand
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${b.pct}%`, background: `linear-gradient(90deg, ${b.color}cc, ${b.color})` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold" style={{ color: b.color }}>
                    {b.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <AlertTriangle className="h-3.5 w-3.5" /> 4+ Bucket Critical
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              88 contracts · Demand ₹174L · Recovered only ₹21L (12%) · Nil collection 65 accounts
            </p>
          </div>
        </Panel>

        <Panel title="Branch Collection %" right="Sep'25">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={BRANCH_COLL} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <ReferenceLine x={65} stroke="#EF4444" strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                {BRANCH_COLL.map((b, i) => (
                  <Cell key={i} fill={b.pct >= 65 ? GREEN : b.pct >= 50 ? "#F59E0B" : "#EF4444"} />
                ))}
                <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Mode mix + Nil trend */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Collection Mode Mix" right="% of collected">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={MODE_MIX} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {MODE_MIX.map((m, i) => (
                  <Cell key={i} fill={m.color} />
                ))}
                <LabelList dataKey="value" position="inside" formatter={(v: any) => `${v}%`} style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Nil Collection % Trend" right="Target <7%">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={NIL_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 12]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <ReferenceLine y={NIL_TARGET} stroke="#10B981" strokeDasharray="4 4" label={{ value: "Target 7%", position: "right", fontSize: 9, fill: "#10B981" }} />
              <Line type="monotone" dataKey="pct" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Table */}
      <Panel title="Collection Summary — by Branch" right="Sep'25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">Demand</th>
                <th className="py-2 font-semibold">Collected</th>
                <th className="py-2 font-semibold">Collection %</th>
                <th className="py-2 font-semibold">Nil %</th>
                <th className="py-2 font-semibold">4+ Bucket</th>
              </tr>
            </thead>
            <tbody>
              {COLL_TABLE.map((r) => (
                <tr key={r.branch} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.branch}</td>
                  <td className="py-2.5 text-slate-600">{r.demand}</td>
                  <td className="py-2.5 text-slate-600">{r.collected}</td>
                  <td className={`py-2.5 font-semibold ${TONE[r.tone]}`}>{r.coll}</td>
                  <td className="py-2.5 text-slate-600">{r.nil}</td>
                  <td className="py-2.5 font-medium text-rose-500">{r.b4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
