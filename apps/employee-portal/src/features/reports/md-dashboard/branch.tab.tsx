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
} from "recharts";
import {
  BRANCH_CARDS,
  BRANCH_DISB,
  BRANCH_NPA,
  DISB_VS_COLL,
  BRANCH_SCORECARD,
  type BranchStatus,
} from "./branch.data";

const NAVY = "#1E2A6B";
const GRAY = "#94A3B8";

const STATUS_BADGE: Record<BranchStatus, string> = {
  Match: "bg-[#1E2A6B] text-white",
  OK: "bg-emerald-600 text-white",
  Watch: "bg-amber-500 text-white",
  "High Risk": "bg-rose-600 text-white",
};

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

export function BranchTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {BRANCH_CARDS.map((c) => (
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

      {/* Disb achievement + NPA by branch */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Disbursement Achievement % — by Branch" right="Sep vs Target">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={BRANCH_DISB} layout="vertical" margin={{ left: 10, right: 36 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 180]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <ReferenceLine x={100} stroke={NAVY} strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                {BRANCH_DISB.map((b, i) => (
                  <Cell key={i} fill={b.pct >= 100 ? "#10B981" : b.pct >= 75 ? "#F59E0B" : "#EF4444"} />
                ))}
                <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Net NPA % — by Branch" right="Target <2%">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={BRANCH_NPA} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <ReferenceLine x={2} stroke="#10B981" strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                {BRANCH_NPA.map((b, i) => (
                  <Cell key={i} fill={b.pct >= 4 ? "#EF4444" : b.pct >= 2.5 ? "#F59E0B" : "#10B981"} />
                ))}
                <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Disb vs collection grouped */}
      <Panel title="Disbursement % vs Collection % — by Branch" right="Sep'25">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={DISB_VS_COLL} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="branch" tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="disb" name="Disbursement %" fill="#2563EB" radius={[3, 3, 0, 0]} />
            <Bar dataKey="coll" name="Collection %" fill="#10B981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      {/* Scorecard table */}
      <Panel title="Branch Scorecard — Sep'25" right="10 branches">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">Disb %</th>
                <th className="py-2 font-semibold">YTD %</th>
                <th className="py-2 font-semibold">Collection %</th>
                <th className="py-2 font-semibold">IRR %</th>
                <th className="py-2 font-semibold">Net NPA %</th>
                <th className="py-2 font-semibold">RC Cases</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {BRANCH_SCORECARD.map((r) => (
                <tr key={r.branch} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.branch}</td>
                  <td className="py-2.5 font-medium text-amber-600">{r.disb}</td>
                  <td className="py-2.5 text-slate-600">{r.ytd}</td>
                  <td className="py-2.5 text-slate-600">{r.coll}</td>
                  <td className="py-2.5 text-slate-600">{r.irr}</td>
                  <td className="py-2.5 font-medium text-rose-500">{r.npa}</td>
                  <td className="py-2.5 text-slate-600">{r.rc}</td>
                  <td className="py-2.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
