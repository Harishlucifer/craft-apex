import { useEffect, useState } from "react";
import {
  Banknote,
  Percent,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  UserRound,
  ArrowUp,
  ArrowDown,
  CircleAlert,
} from "lucide-react";
import {
  COMPANY_HEALTH,
  YTD_PROGRESS,
  BRANCHES,
  CRITICAL_ALERTS,
  OM_ACTIONS,
  OD_BUCKETS,
  TABS,
  type NpaStatus,
} from "./md-dashboard.data";
import { DisbursementTab } from "./disbursement.tab";
import { PortfolioMixTab } from "./portfolio-mix.tab";
import { CollectionTab } from "./collection.tab";
import { NpaTab } from "./npa.tab";
import { RcPddTab } from "./rc-pdd.tab";
import { BranchTab } from "./branch.tab";
import { ManpowerTab } from "./manpower.tab";

const NAVY = "#1E2A6B";
const BLUE = "#2563EB";

/** Flips true just after first paint so CSS transitions animate bars in. */
function useGrow() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

const HEALTH_ICON = {
  disbursement: Banknote,
  collection: Percent,
  irr: AlertTriangle,
  gross: TrendingUp,
  net: CheckCircle2,
  rc: UserRound,
} as const;

// Per-metric accent colour for the icon tiles.
const HEALTH_ACCENT: Record<string, string> = {
  disbursement: "#2563EB",
  collection: "#10B981",
  irr: "#7C3AED",
  gross: "#0EA5E9",
  net: "#F59E0B",
  rc: "#EF4444",
};

const TONE_TEXT: Record<string, string> = {
  good: "text-emerald-600",
  bad: "text-rose-500",
  warn: "text-amber-600",
  neutral: "text-emerald-600",
  info: "text-slate-600",
};

const NPA_BADGE: Record<NpaStatus, string> = {
  Match: "bg-[#1E2A6B] text-white",
  OK: "bg-emerald-600 text-white",
  Watch: "bg-amber-500 text-white",
  "High Risk": "bg-rose-600 text-white",
};

export default function MdDashboardPage() {
  const [tab, setTab] = useState<string>("MD Dashboard");

  return (
    <div className="space-y-4">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          MD Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Reports <span className="mx-1">›</span>
          <span className="text-slate-600">MD Dashboard</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            }
            style={tab === t ? { backgroundColor: NAVY } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Disbursement" ? (
        <>
          <SectionTitle>Disbursement</SectionTitle>
          <DisbursementTab />
        </>
      ) : tab === "Portfolio Mix" ? (
        <>
          <SectionTitle>Portfolio Mix</SectionTitle>
          <PortfolioMixTab />
        </>
      ) : tab === "Collection" ? (
        <>
          <SectionTitle>Collection</SectionTitle>
          <CollectionTab />
        </>
      ) : tab === "NPA" ? (
        <>
          <SectionTitle>NPA</SectionTitle>
          <NpaTab />
        </>
      ) : tab === "RC / PDD" ? (
        <>
          <SectionTitle>RC / PDD</SectionTitle>
          <RcPddTab />
        </>
      ) : tab === "Branch" ? (
        <>
          <SectionTitle>Branch</SectionTitle>
          <BranchTab />
        </>
      ) : tab === "Manpower" ? (
        <>
          <SectionTitle>Manpower</SectionTitle>
          <ManpowerTab />
        </>
      ) : tab !== "MD Dashboard" ? (
        <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
          {tab} view — coming soon
        </div>
      ) : (
        <>
          <CompanyHealth />
          <YtdProgress />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <BranchPerformance />
            </div>
            <div className="xl:col-span-2">
              <CriticalAlerts />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <OmActionTracker />
            <OdBucketSnapshot />
          </div>
        </>
      )}

      <footer className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
        <span>© {new Date().getFullYear()} LendingStack.</span>
        <span>Designed &amp; Developed by Inforvio Technologies Pvt Ltd</span>
      </footer>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 64;
  const h = 22;
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}1a`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
      <span
        className="h-3.5 w-1 rounded-full"
        style={{ background: `linear-gradient(${NAVY}, ${BLUE})` }}
      />
      {children}
    </h2>
  );
}

function CompanyHealth() {
  return (
    <section>
      <SectionTitle>Company Health · Sep'25</SectionTitle>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {COMPANY_HEALTH.map((c) => {
          const Icon = HEALTH_ICON[c.key];
          const Arrow = c.dir === "up" ? ArrowUp : ArrowDown;
          const accent = HEALTH_ACCENT[c.key]!;
          return (
            <div
              key={c.key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* top accent */}
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
              />
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${accent}1a`, color: accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {c.label}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{c.sub}</p>
                </div>
                <Sparkline data={[...c.trend]} color={accent} />
              </div>
              <p
                className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${TONE_TEXT[c.tone]}`}
              >
                <Arrow className="h-3 w-3" />
                {c.note}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function YtdProgress() {
  const max = 80;
  const grown = useGrow();
  return (
    <section>
      <SectionTitle>YTD Progress · Apr to Sep'25</SectionTitle>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {YTD_PROGRESS.map((p) => (
          <div
            key={p.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${BLUE}14`, color: NAVY }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  {p.title}
                </h3>
                <p className="text-[11px] text-slate-400">{p.subtitle}</p>
              </div>
              <span className="text-lg font-bold text-slate-900">{p.pct}%</span>
            </div>

            {/* progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: grown ? `${Math.min(p.pct, 100)}%` : "0%",
                  background: `linear-gradient(90deg, ${NAVY}, ${BLUE})`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px]">
              <span className="text-slate-500">
                Actual: <b className="text-slate-700">{p.actual}</b>
              </span>
              <span className="text-slate-500">
                Target: <b className="text-slate-700">{p.target}</b>
              </span>
              <span className="text-slate-500">
                Gap: <b className="text-slate-700">{p.gap}</b>
              </span>
            </div>

            {/* monthly bars */}
            <div className="mt-4 flex gap-2">
              {/* y-axis */}
              <div className="flex h-32 flex-col justify-between py-0.5 text-right text-[9px] text-slate-300">
                {[80, 60, 40, 20, 0].map((y) => (
                  <span key={y}>{y}%</span>
                ))}
              </div>
              <div className="flex-1">
                <div className="relative flex h-32 items-end gap-2">
                  {/* gridlines */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-slate-100" />
                    ))}
                  </div>
                  {p.bars.map((b) => (
                    <div
                      key={b.month}
                      className="relative flex flex-1 items-start justify-center overflow-hidden rounded-t-md pt-1 text-[10px] font-semibold text-white shadow-sm transition-[height,filter] duration-700 ease-out hover:brightness-110"
                      style={{
                        height: grown ? `${(b.value / max) * 100}%` : "0%",
                        background: `linear-gradient(180deg, ${BLUE}, ${NAVY})`,
                      }}
                    >
                      {b.value}%
                    </div>
                  ))}
                </div>
                {/* month labels */}
                <div className="mt-1 flex gap-2">
                  {p.bars.map((b) => (
                    <span
                      key={b.month}
                      className="flex-1 text-center text-[10px] font-medium text-slate-400"
                    >
                      {b.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BranchPerformance() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>Branch Performance Headwise · Sep'25</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
              <th className="py-2 font-semibold">Branch</th>
              <th className="py-2 font-semibold">Disb. Sep %</th>
              <th className="py-2 font-semibold">YTD Achvmt</th>
              <th className="py-2 font-semibold">Collection %</th>
              <th className="py-2 font-semibold">IRR %</th>
              <th className="py-2 font-semibold">NPA Est.</th>
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((b) => (
              <tr
                key={b.branch}
                className="border-b border-slate-50 transition hover:bg-slate-50/70"
              >
                <td className="py-2.5 font-semibold text-slate-800">{b.branch}</td>
                <Cell value={b.disb} sub="Sep vs Tgt" valueClass="text-amber-600" />
                <Cell value={b.ytd} sub="YTD Achvmt" />
                <Cell value={b.collection} sub="Sep Coll" />
                <Cell value={b.irr} sub="Avg IRR" />
                <td className="py-2.5">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${NPA_BADGE[b.npa]}`}
                  >
                    {b.npa}
                  </span>
                  <p className="mt-0.5 text-[10px] text-slate-400">NPA Risk</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Showing 10 of 10 Results</span>
        <div className="flex items-center gap-1">
          <span className="rounded border border-slate-200 px-2 py-1">Previous</span>
          <span
            className="rounded px-2 py-1 font-semibold text-white"
            style={{ backgroundColor: NAVY }}
          >
            1
          </span>
          <span className="rounded border border-slate-200 px-2 py-1">Next</span>
        </div>
      </div>
    </section>
  );
}

function Cell({
  value,
  sub,
  valueClass = "text-slate-800",
}: {
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <td className="py-2.5">
      <p className={`font-semibold ${valueClass}`}>{value}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </td>
  );
}

function CriticalAlerts() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <SectionTitle>Critical Alerts</SectionTitle>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: NAVY }}
        >
          3 Critical · 2 Watch
        </span>
      </div>
      <div className="space-y-3">
        {CRITICAL_ALERTS.map((a, i) => {
          const isCrit = a.severity === "critical";
          return (
            <div
              key={i}
              className={`rounded-lg border p-3 ${
                isCrit
                  ? "border-rose-100 bg-rose-50/60"
                  : "border-amber-100 bg-amber-50/60"
              }`}
            >
              <div className="flex items-start gap-2">
                <CircleAlert
                  className={`mt-0.5 h-4 w-4 shrink-0 ${isCrit ? "text-rose-500" : "text-amber-500"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs font-semibold ${isCrit ? "text-rose-700" : "text-amber-700"}`}
                    >
                      {a.title}
                    </h4>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: NAVY }}
                    >
                      {a.badge}
                    </span>
                  </div>
                  {a.lines.map((l, j) => (
                    <p key={j} className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {l}
                    </p>
                  ))}
                  {a.action && (
                    <div className="mt-2">
                      <span className="mr-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        Action
                      </span>
                      <span className="text-[11px] text-slate-500">{a.action}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OmActionTracker() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <SectionTitle>OM Action Tracker</SectionTitle>
        <span className="text-[11px] text-slate-400">Last review: 21-Aug-2025</span>
      </div>
      <ul className="space-y-2">
        {OM_ACTIONS.map((a) => (
          <li
            key={a.n}
            className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: NAVY }}
            >
              {a.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">{a.title}</p>
              <p className="text-[10px] text-slate-400">{a.owner}</p>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${
                a.tone === "good"
                  ? "bg-emerald-100 text-emerald-700"
                  : a.tone === "bad"
                    ? "bg-rose-100 text-rose-700"
                    : a.tone === "warn"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
              }`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OdBucketSnapshot() {
  const grown = useGrow();
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle>OD Bucket Snapshot · Sep'25</SectionTitle>
        <span className="text-[11px] text-slate-400">Demand vs Collection · ₹ Lakhs</span>
      </div>

      <div className="space-y-3">
        {OD_BUCKETS.map((b) => (
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
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: grown ? `${b.pct}%` : "0%",
                    background: `linear-gradient(90deg, ${b.color}cc, ${b.color})`,
                  }}
                />
              </div>
              <span
                className="w-12 text-right text-xs font-bold"
                style={{ color: b.color }}
              >
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

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">91.4%</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            0+1+2 Efficiency
          </p>
          <p className="text-[10px] text-slate-400">Target 95%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xl font-bold text-rose-500">9.26%</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Nil Collection
          </p>
          <p className="text-[10px] text-slate-400">Target &lt;7%</p>
        </div>
      </div>
    </section>
  );
}
