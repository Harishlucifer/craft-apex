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
  PieChart,
  Pie,
} from "recharts";
import {
  MANPOWER_CARDS,
  FOS_STRENGTH,
  FOS_TARGET,
  HIRING_PLAN,
  FOS_BY_ROLE,
  FOS_BY_BRANCH,
  VACANCY_BY_BRANCH,
  MANPOWER_TABLE,
} from "./manpower.data";

const NAVY = "#1E2A6B";
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

export function ManpowerTab() {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {MANPOWER_CARDS.map((c) => (
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

      {/* Strength trend + hiring plan + role mix */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="FOS Strength % Trend" right="Target 80%">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={FOS_STRENGTH}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[50, 85]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <ReferenceLine y={FOS_TARGET} stroke="#10B981" strokeDasharray="4 4" label={{ value: "80%", position: "right", fontSize: 9, fill: "#10B981" }} />
              <Line type="monotone" dataKey="pct" stroke={NAVY} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Hiring Plan" right="Nov – Jan">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={HIRING_PLAN} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="planned" fill="#10B981" radius={[4, 4, 0, 0]} barSize={48}>
                <LabelList dataKey="planned" position="top" style={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="FOS by Role" right="50 total">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={FOS_BY_ROLE} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
                {FOS_BY_ROLE.map((r, i) => (
                  <Cell key={i} fill={r.color} />
                ))}
                <LabelList dataKey="value" position="inside" style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* FOS actual vs budgeted + vacancies */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="FOS — Actual vs Budgeted by Branch" right="Sep'25">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FOS_BY_BRANCH} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="branch" tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budgeted" name="Budgeted" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#2563EB" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Vacancies by Branch" right="Open positions">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={VACANCY_BY_BRANCH} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="vacancy" radius={[0, 4, 4, 0]} barSize={14}>
                {VACANCY_BY_BRANCH.map((b, i) => (
                  <Cell key={i} fill={b.vacancy >= 4 ? "#EF4444" : b.vacancy >= 2 ? "#F59E0B" : "#10B981"} />
                ))}
                <LabelList dataKey="vacancy" position="right" style={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Table */}
      <Panel title="Manpower Summary — by Branch" right="Sep'25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">Budgeted</th>
                <th className="py-2 font-semibold">Actual</th>
                <th className="py-2 font-semibold">Vacancy</th>
                <th className="py-2 font-semibold">Fill %</th>
                <th className="py-2 font-semibold">Attrition</th>
                <th className="py-2 font-semibold">Productivity</th>
              </tr>
            </thead>
            <tbody>
              {MANPOWER_TABLE.map((r) => (
                <tr key={r.branch} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  <td className="py-2.5 font-semibold text-slate-800">{r.branch}</td>
                  <td className="py-2.5 text-slate-600">{r.budgeted}</td>
                  <td className="py-2.5 text-slate-600">{r.actual}</td>
                  <td className="py-2.5 font-medium text-rose-500">{r.vacancy}</td>
                  <td className={`py-2.5 font-semibold ${TONE[r.tone]}`}>{r.fill}</td>
                  <td className="py-2.5 text-slate-600">{r.attrition}</td>
                  <td className="py-2.5 text-slate-600">{r.productivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
