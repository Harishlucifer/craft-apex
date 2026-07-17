import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  AreaChart,
  Area,
} from "recharts";
import {
  PMIX_CARDS,
  PRODUCT_COLORS,
  PRODUCT_MIX,
  SECURED_MIX,
  TICKET_BUCKETS,
  TENURE_MIX,
  REGION_MIX,
  AUM_BY_PRODUCT,
  PMIX_TABLE,
} from "./portfolio-mix.data";

const BLUE = "#2563EB";
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

export function PortfolioMixTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {PMIX_CARDS.map((c) => (
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

      {/* Product mix donut + Secured donut */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Product Mix — by AUM (₹L)" right="Sep'25">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={PRODUCT_MIX}
                dataKey="aum"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {PRODUCT_MIX.map((_, i) => (
                  <Cell key={i} fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Secured vs Unsecured" right="Share of AUM">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={SECURED_MIX}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {SECURED_MIX.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="inside"
                  formatter={(v: any) => `${v}%`}
                  style={{ fill: "#fff", fontSize: 12, fontWeight: 700 }}
                />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Geography Mix — by Branch" right="% of AUM">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={REGION_MIX} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={70} />
              <Tooltip />
              <Bar dataKey="share" fill={BLUE} radius={[0, 4, 4, 0]} barSize={14}>
                <LabelList dataKey="share" position="right" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Ticket buckets + Tenure mix */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Ticket-Size Distribution" right="No. of contracts">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TICKET_BUCKETS} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={48}>
                <LabelList dataKey="count" position="top" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Tenure Mix" right="% of contracts">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TENURE_MIX} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 40]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <Bar dataKey="share" fill="#10B981" radius={[4, 4, 0, 0]} barSize={48}>
                <LabelList dataKey="share" position="top" formatter={(v: any) => `${v}%`} style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* AUM by product trend */}
      <Panel title="AUM by Product — Trend (₹L)" right="Apr – Sep'25">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={AUM_BY_PRODUCT}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="LAP" stackId="1" stroke="#2563EB" fill="#2563EB" fillOpacity={0.7} />
            <Area type="monotone" dataKey="Home" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.7} />
            <Area type="monotone" dataKey="Business" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.7} />
            <Area type="monotone" dataKey="Others" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.7} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      {/* Table */}
      <Panel title="Portfolio Summary — by Product" right="Sep'25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Product</th>
                <th className="py-2 font-semibold">Contracts</th>
                <th className="py-2 font-semibold">AUM</th>
                <th className="py-2 font-semibold">Share</th>
                <th className="py-2 font-semibold">Avg Ticket</th>
                <th className="py-2 font-semibold">NPA %</th>
              </tr>
            </thead>
            <tbody>
              {PMIX_TABLE.map((r, i) => (
                <tr key={r.product} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }}
                      />
                      {r.product}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{r.contracts}</td>
                  <td className="py-2.5 font-medium text-slate-800">{r.aum}</td>
                  <td className="py-2.5 text-slate-600">{r.share}</td>
                  <td className="py-2.5 text-slate-600">{r.ats}</td>
                  <td className={`py-2.5 font-semibold ${TONE[r.tone]}`}>{r.npa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
