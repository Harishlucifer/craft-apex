import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  NPA_CARDS,
  NPA_TREND,
  NET_NPA_TARGET,
  BUCKET_GROWTH,
  DPD_BUCKETS,
  NPA_BY_PRODUCT,
  NPA_BY_BRANCH,
  SLIP_RECOVERY,
  NPA_TABLE,
} from "./npa.data";

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

function npaColor(pct: number): string {
  return pct >= 4 ? RED : pct >= 2.5 ? "#F59E0B" : "#10B981";
}

export function NpaTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {NPA_CARDS.map((c) => (
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

      {/* NPA trend + 4+ bucket growth */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Gross & Net NPA % Trend" right="Target Net <2%">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={NPA_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 4]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={NET_NPA_TARGET} stroke="#10B981" strokeDasharray="4 4" label={{ value: "Target 2%", position: "right", fontSize: 9, fill: "#10B981" }} />
              <Line type="monotone" dataKey="gross" name="Gross NPA %" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="net" name="Net NPA %" stroke={RED} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="4+ Bucket Contracts — Growth" right="Apr 51 → Sep 88">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BUCKET_GROWTH} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="contracts" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={42}>
                <LabelList dataKey="contracts" position="top" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* DPD buckets + Slippage vs Recovery */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="NPA by DPD Bucket (₹L)" right="Days past due">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DPD_BUCKETS} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
              <Tooltip />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={46}>
                {DPD_BUCKETS.map((_, i) => (
                  <Cell key={i} fill={["#F59E0B", "#FB923C", "#F97316", "#EF4444", "#B91C1C"][i]} />
                ))}
                <LabelList dataKey="amount" position="top" formatter={(v: any) => `₹${v}L`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Slippage vs Recovery (accounts)" right="Apr – Sep'25">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SLIP_RECOVERY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="slippage" name="Slippage" fill={RED} radius={[3, 3, 0, 0]} />
              <Bar dataKey="recovery" name="Recovery" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* NPA by product + by branch */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="NPA % by Product" right="Sep'25">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={NPA_BY_PRODUCT} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="product" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={90} />
              <Tooltip />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                {NPA_BY_PRODUCT.map((p, i) => (
                  <Cell key={i} fill={npaColor(p.pct)} />
                ))}
                <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Net NPA % by Branch" right="Sep'25">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={NPA_BY_BRANCH} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <ReferenceLine x={2} stroke="#10B981" strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                {NPA_BY_BRANCH.map((b, i) => (
                  <Cell key={i} fill={npaColor(b.pct)} />
                ))}
                <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Table */}
      <Panel title="NPA Summary — by Branch" right="Sep'25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">Gross NPA %</th>
                <th className="py-2 font-semibold">Net NPA %</th>
                <th className="py-2 font-semibold">Accounts</th>
                <th className="py-2 font-semibold">NPA Amount</th>
                <th className="py-2 font-semibold">Recovery</th>
              </tr>
            </thead>
            <tbody>
              {NPA_TABLE.map((r) => (
                <tr key={r.branch} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.branch}</td>
                  <td className="py-2.5 text-slate-600">{r.gnpa}</td>
                  <td className={`py-2.5 font-semibold ${TONE[r.tone]}`}>{r.nnpa}</td>
                  <td className="py-2.5 text-slate-600">{r.accounts}</td>
                  <td className="py-2.5 font-medium text-rose-500">{r.amount}</td>
                  <td className="py-2.5 text-emerald-600">{r.recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
