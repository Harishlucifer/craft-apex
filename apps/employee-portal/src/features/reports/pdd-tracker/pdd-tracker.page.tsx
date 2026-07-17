import { useMemo, useState } from "react";
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
} from "recharts";
import { Triangle } from "lucide-react";
import { Button, Input } from "@craft-apex/ui";
import {
  PDD_PRODUCTS,
  PDD_KPIS,
  DOC_SPLIT,
  AGING_BY_DOC,
  BRANCH_GAP,
  PDD_CASES,
} from "./pdd-tracker.data";

const RED = "#EF4444";
const AMBER = "#F59E0B";
const TEAL = "#14B8A6";
const GRAY = "#94A3B8";

function agingTone(days: number): { color: string; label: string } {
  if (days > 90) return { color: RED, label: "Critical" };
  if (days >= 60) return { color: AMBER, label: "Warning" };
  return { color: "#10B981", label: "OK" };
}

export default function PddTrackerPage() {
  const [product, setProduct] = useState(PDD_PRODUCTS[0]!.name);
  const [search, setSearch] = useState("");

  const cases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PDD_CASES;
    return PDD_CASES.filter(
      (c) =>
        c.customer.toLowerCase().includes(q) ||
        c.contract.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Product tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {PDD_PRODUCTS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setProduct(p.name)}
            className={
              product === p.name
                ? "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                : "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            }
            style={product === p.name ? { backgroundColor: "#1E2A6B" } : undefined}
          >
            {p.name}
            <span
              className={`rounded px-1 text-[10px] ${
                product === p.name ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {p.count}
            </span>
          </button>
        ))}
      </div>

      {/* Threshold banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-2 text-[11px] text-amber-800">
        <span className="font-semibold">Aging thresholds for {product}:</span>{" "}
        <span className="text-rose-600">Critical: &gt;90 days</span> ·{" "}
        <span className="text-amber-600">Warning: 60–90 days</span> ·{" "}
        <span className="text-emerald-600">OK: &lt;60 days</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {PDD_KPIS.map((k) => (
          <div
            key={k.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {k.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{k.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
              {k.up && <Triangle className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />}
              {k.note}
            </p>
          </div>
        ))}
      </div>

      {/* Doc split + aging by doc + branch gap */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Panel title="Doc Type Split">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={DOC_SPLIT} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                {DOC_SPLIT.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Aging by Doc Type">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={AGING_BY_DOC} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="doc" tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[0, 20]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Critical" stackId="a" fill={RED} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Warning" stackId="a" fill={AMBER} />
              <Bar dataKey="OK" stackId="a" fill={TEAL} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <div className="xl:col-span-2">
          <Panel title="Branch-wise Document Gap" right="Heatmap · pending count per doc type">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 font-semibold">Branch</th>
                    <th className="py-2 text-center font-semibold">Invoice</th>
                    <th className="py-2 text-center font-semibold">RC</th>
                    <th className="py-2 text-center font-semibold">Veh. Ins.</th>
                    <th className="py-2 text-center font-semibold">PDC</th>
                    <th className="py-2 font-semibold">Aging Mix</th>
                  </tr>
                </thead>
                <tbody>
                  {BRANCH_GAP.map((b) => (
                    <tr key={b.branch} className="border-b border-slate-50">
                      <td className="py-2 font-semibold text-slate-700">{b.branch}</td>
                      <GapCell value={b.invoice} color="#F59E0B" />
                      <GapCell value={b.rc} color="#14B8A6" />
                      <GapCell value={b.veh} color="#EF4444" />
                      <GapCell value={b.pdc} color="#2563EB" />
                      <td className="py-2">
                        <AgingMix mix={b.mix} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      {/* PDD cases table */}
      <Panel title="PDD Cases" right={`${cases.length} records`}>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="mb-3 max-w-xs"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">#</th>
                <th className="py-2 font-semibold">Branch</th>
                <th className="py-2 font-semibold">Contract No.</th>
                <th className="py-2 font-semibold">Customer</th>
                <th className="py-2 font-semibold">Executive</th>
                <th className="py-2 font-semibold">Doc Type</th>
                <th className="py-2 font-semibold">Aging (days)</th>
                <th className="py-2 font-semibold">Aging Status</th>
                <th className="py-2 font-semibold">Disb. Date</th>
                <th className="py-2 font-semibold">Vehicle</th>
                <th className="py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const t = agingTone(c.aging);
                return (
                  <tr key={c.sl} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                    <td className="py-2.5 text-slate-400">{c.sl}</td>
                    <td className="py-2.5 text-slate-600">{c.branch}</td>
                    <td className="py-2.5 font-mono text-xs text-slate-500">{c.contract}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{c.customer}</td>
                    <td className="py-2.5 text-slate-600">{c.executive}</td>
                    <td className="py-2.5 text-slate-600">{c.docType}</td>
                    <td className="py-2.5 font-bold" style={{ color: t.color }}>
                      {c.aging}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{c.disb}</td>
                    <td className="py-2.5 text-slate-600">{c.vehicle}</td>
                    <td className="py-2.5">
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

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

function GapCell({ value, color }: { value: number; color: string }) {
  return (
    <td className="py-2 text-center">
      {value > 0 ? (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {value}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      )}
    </td>
  );
}

function AgingMix({ mix }: { mix: { c: number; w: number; o: number } }) {
  const total = mix.c + mix.w + mix.o || 1;
  return (
    <div className="flex h-2 w-24 overflow-hidden rounded-full bg-slate-100">
      <div style={{ width: `${(mix.c / total) * 100}%`, backgroundColor: RED }} />
      <div style={{ width: `${(mix.w / total) * 100}%`, backgroundColor: AMBER }} />
      <div style={{ width: `${(mix.o / total) * 100}%`, backgroundColor: TEAL }} />
    </div>
  );
}
