import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
  PieChart,
  Pie,
} from "recharts";
import {
  RCPDD_CARDS,
  RC_AGING,
  RC_TREND,
  RC_BY_BRANCH,
  PDD_AGING,
  PDD_BY_TYPE,
  PDD_BY_BRANCH,
  RCPDD_TABLE,
} from "./rc-pdd.data";

const NAVY = "#1E2A6B";
const GRAY = "#94A3B8";
const RED = "#EF4444";

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

export function RcPddTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {RCPDD_CARDS.map((c) => (
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

      {/* RC aging + RC trend */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="RC Aging Buckets (cases)" right="Days open">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={RC_AGING} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 40]} />
              <Tooltip />
              <Bar dataKey="cases" radius={[4, 4, 0, 0]} barSize={46}>
                {RC_AGING.map((_, i) => (
                  <Cell key={i} fill={["#F59E0B", "#FB923C", "#F97316", "#EF4444", "#B91C1C"][i]} />
                ))}
                <LabelList dataKey="cases" position="top" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="RC Cases — New vs Resolved vs Open" right="Apr – Sep'25">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={RC_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="newRc" name="New RC" fill={RED} radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[3, 3, 0, 0]} barSize={14} />
              <Line type="monotone" dataKey="open" name="Open" stroke={NAVY} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* RC by branch + PDD aging */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="RC Cases by Branch" right="Open cases">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={RC_BY_BRANCH} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 16]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="cases" radius={[0, 4, 4, 0]} barSize={14}>
                {RC_BY_BRANCH.map((b, i) => (
                  <Cell key={i} fill={b.cases >= 10 ? RED : b.cases >= 6 ? "#F59E0B" : "#10B981"} />
                ))}
                <LabelList dataKey="cases" position="right" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="PDD Aging (documents)" right="Days pending">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={PDD_AGING} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={56}>
                {PDD_AGING.map((_, i) => (
                  <Cell key={i} fill={["#10B981", "#F59E0B", "#F97316", "#EF4444"][i]} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* PDD by type + PDD by branch */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="PDD by Document Type" right="Pending count">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={PDD_BY_TYPE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={2}>
                {PDD_BY_TYPE.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
                <LabelList dataKey="value" position="inside" style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="PDD Pending by Branch" right="Documents">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={PDD_BY_BRANCH} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={14}>
                <LabelList dataKey="count" position="right" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Table */}
      <Panel title="RC / PDD Summary — by Branch" right="Sep'25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">RC Cases</th>
                <th className="py-2 font-semibold">RC &gt;120d</th>
                <th className="py-2 font-semibold">PDD Pending</th>
                <th className="py-2 font-semibold">PDD Overdue</th>
                <th className="py-2 font-semibold">Compliance %</th>
              </tr>
            </thead>
            <tbody>
              {RCPDD_TABLE.map((r) => (
                <tr key={r.branch} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.branch}</td>
                  <td className="py-2.5 text-slate-600">{r.rc}</td>
                  <td className="py-2.5 font-medium text-rose-500">{r.rc120}</td>
                  <td className="py-2.5 text-slate-600">{r.pdd}</td>
                  <td className="py-2.5 font-medium text-amber-600">{r.overdue}</td>
                  <td className={`py-2.5 font-semibold ${TONE[r.tone]}`}>{r.compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
