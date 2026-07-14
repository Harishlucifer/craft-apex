import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { useModule } from "@craft-apex/layout";
import { Button, Input, Label, Skeleton } from "@craft-apex/ui";
import { useDashboardSummary } from "./dashboard.api";
import type { DashboardFilterState, SummaryWidget } from "./dashboard.types";

// Legacy: channel-flexi/src/Components/Common/Dashboard/index.js
//         + DashboardSummary.js + DashboardFilter.js
//
// Deviations from legacy, all deliberate:
//  - Flatpickr range picker → two native <input type="date"> fields (no new dep).
//  - ApexCharts radialBar per card → a plain SVG ring / bar (recharts has no
//    radial gauge that is cheaper than this, and the card only shows one value).
//  - The hero banner image (tenant.system.other_data.dashboard_banner) is not
//    ported: partner-portal makes no /alpha/v1/setup tenant call yet.

const NAVY = "#1E2A6B";
const BLUE = "#4C7DF0";
const GREEN = "#5FDD98";
const ACCENTS = [BLUE, GREEN, NAVY, "#F59E0B", "#EC4899", "#06B6D4"];

/** Legacy DashboardFilter.getGreetings — same hour thresholds. */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 20) return "Good Evening";
  if (h >= 20 && h < 24) return "Good Night";
  return "Hello!";
}

/** Legacy dateFormatter — yyyy-MM-dd (also the value format of <input type="date">). */
function fmtApi(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** yyyy-MM-dd → Date, +1 day → yyyy-MM-dd (legacy sends end + 1 day as to_date). */
function plusOneDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return fmtApi(addDays(new Date(y, m - 1, d), 1));
}

const clampPct = (v: number) => Math.max(0, Math.min(100, Number(v) || 0));
const pctLabel = (v: number) => {
  const p = clampPct(v);
  return `${p % 1 === 0 ? p : p.toFixed(2)}%`;
};

/** Hero tile — the first widget of a section (usually the total). */
function FeatureTile({
  widget,
  rowSpan,
  onClick,
}: {
  widget: SummaryWidget;
  rowSpan: number;
  onClick: (w: SummaryWidget) => void;
}) {
  const clickable = Boolean(widget.count !== 0);
  const pct = clampPct(widget.percentage);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  return (
    <div
      onClick={() => onClick(widget)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white ${
        clickable ? "cursor-pointer" : ""
      }`}
      style={{
        background: `linear-gradient(150deg, ${NAVY} 0%, ${BLUE} 135%)`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
        style={{ backgroundColor: `${GREEN}33` }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {widget.name}
        </p>
        {clickable && <ArrowUpRight className="h-5 w-5 shrink-0 text-white/70" />}
      </div>

      <div className="relative flex flex-1 items-center justify-center py-4">
        <div className="relative aspect-square w-full max-w-[180px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="10"
            />
            {pct > 0 && (
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                className="transition-[stroke-dashoffset] duration-700"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold leading-none tracking-tight">
              {widget.count}
            </span>
            <span className="mt-1 text-xs font-semibold text-white/70">
              {pctLabel(widget.percentage)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>Share</span>
          <span className="font-semibold text-white">
            {pctLabel(widget.percentage)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Compact widget card — big count + a small percentage meter. */
function MetricTile({
  widget,
  accent,
  onClick,
}: {
  widget: SummaryWidget;
  accent: string;
  onClick: (w: SummaryWidget) => void;
}) {
  const clickable = Boolean(widget.count !== 0);
  const pct = clampPct(widget.percentage);
  return (
    <div
      onClick={() => onClick(widget)}
      className={`flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-3.5 transition ${
        clickable ? "cursor-pointer hover:border-slate-200 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {widget.name}
        </p>
        <span
          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
        {widget.count}
      </p>
      <div className="mt-2.5">
        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%`, backgroundColor: accent }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] font-bold text-slate-600">
          {pctLabel(widget.percentage)}
        </p>
      </div>
    </div>
  );
}

function SummarySection({
  title,
  items,
  loading,
  onCardClick,
}: {
  title: string;
  items: SummaryWidget[];
  loading: boolean;
  onCardClick: (w: SummaryWidget) => void;
}) {
  const [feature, ...rest] = items;
  // 4-col grid: the feature tile occupies one column and spans the rows the
  // remaining 3-wide metric grid needs.
  const featureRows = Math.max(1, Math.ceil(rest.length / 3));

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        {items.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            {items.length} metrics
          </span>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">
          No summary available for this period.
        </p>
      ) : (
        <div className="grid auto-rows-[1fr] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {feature && (
            <FeatureTile
              widget={feature}
              rowSpan={featureRows}
              onClick={onCardClick}
            />
          )}
          {rest.map((w, i) => (
            <MetricTile
              key={`${w.name}-${i}`}
              widget={w}
              accent={ACCENTS[i % ACCENTS.length] ?? BLUE}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const module = useModule();

  const userName =
    (typeof user?.username === "string" ? user.username : undefined) ??
    user?.name ??
    user?.email ??
    "User";

  const permission = module?.node.allowed_permission;
  const configuration = module?.node.configuration;

  const leadVisibility = Number(permission?.["lead_visibility"]) || 90;
  /** legacy: minDate is only enforced when lead_visibility is configured */
  const hasLeadVisibility = permission?.["lead_visibility"] != null;
  const excludeJourneyTypes = configuration?.["exclude_journey_types"];
  const exclude =
    typeof excludeJourneyTypes === "string" ? excludeJourneyTypes : undefined;
  const listPathValue = configuration?.["list_path"];
  const listPath = typeof listPathValue === "string" ? listPathValue : undefined;
  /** legacy DashboardSummary: the lender grid is hidden only when explicitly false */
  const lenderView = permission?.["lender_view"] !== false;

  // Legacy dateSet(): from = today - lead_visibility (default 90); the picker
  // shows [from, today] while the request sends to_date = today + 1 day.
  const defaults = useMemo(() => {
    const today = new Date();
    return {
      from: fmtApi(addDays(today, -leadVisibility)),
      to: fmtApi(today),
      min: hasLeadVisibility ? fmtApi(addDays(today, -leadVisibility)) : undefined,
      max: fmtApi(today),
    };
  }, [leadVisibility, hasLeadVisibility]);

  // The two inputs hold the *displayed* (inclusive) window; `toApi` adds the day.
  const [draft, setDraft] = useState({ from: defaults.from, to: defaults.to });
  const [range, setRange] = useState({ from: defaults.from, to: defaults.to });

  // Legacy useEffect([module.allowed_permission.lead_visibility]) → re-seed dates.
  useEffect(() => {
    setDraft({ from: defaults.from, to: defaults.to });
    setRange({ from: defaults.from, to: defaults.to });
  }, [defaults.from, defaults.to]);

  const fromApi = range.from;
  const toApi = plusOneDay(range.to);

  const { data, isFetching } = useDashboardSummary({
    fromDate: fromApi,
    toDate: toApi,
    exclude,
    enabled: Boolean(fromApi) && Boolean(toApi),
  });

  const lead = data?.lead ?? [];
  const lender = data?.lender ?? [];

  const applyFilter = () => {
    if (!draft.from || !draft.to || draft.from > draft.to) return;
    setRange({ from: draft.from, to: draft.to });
  };

  /**
   * Legacy handleCardClick: merges the widget filter with the active date window
   * and navigates. Lead cards prefer module.configuration.list_path over the
   * widget's own route; lender cards always use the widget route.
   */
  const cardNavigator =
    (preferListPath: boolean) => (widget: SummaryWidget) => {
      const target = preferListPath ? (listPath ?? widget.route) : widget.route;
      if (!target || widget.count === 0) return;
      const filterData: DashboardFilterState = {
        ...(widget.filter ?? {}),
        date_type: "created_date",
        start_date: fromApi,
        end_date: toApi,
      };
      navigate(target, { state: { filterData } });
    };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Legacy DashboardFilter: greeting + date range */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-lg text-slate-400">{getGreeting()}, </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {userName}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="from_date" className="text-[11px] text-slate-500">
              From
            </Label>
            <Input
              id="from_date"
              type="date"
              className="h-9 w-[150px]"
              value={draft.from}
              min={defaults.min}
              max={defaults.max}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to_date" className="text-[11px] text-slate-500">
              To
            </Label>
            <Input
              id="to_date"
              type="date"
              className="h-9 w-[150px]"
              value={draft.to}
              min={draft.from || defaults.min}
              max={defaults.max}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>
          <Button
            size="sm"
            className="h-9"
            onClick={applyFilter}
            disabled={
              !draft.from ||
              !draft.to ||
              draft.from > draft.to ||
              (draft.from === range.from && draft.to === range.to)
            }
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Lead wise summary — always rendered (legacy: result.lead) */}
      <SummarySection
        title="Lead wise summary"
        items={lead}
        loading={isFetching}
        onCardClick={cardNavigator(true)}
      />

      {/* Lender wise Summary — hidden when allowed_permission.lender_view === false */}
      {lenderView && (
        <>
          <hr className="border-slate-200" />
          <SummarySection
            title="Lender wise Summary"
            items={lender}
            loading={isFetching}
            onCardClick={cardNavigator(false)}
          />
        </>
      )}
    </div>
  );
}
