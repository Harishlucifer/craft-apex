import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { useModule } from "@craft-apex/layout";
import { STORAGE_KEYS } from "@craft-apex/api";
import { useTranslation } from "@craft-apex/i18n";
import { useDashboard } from "./dashboard.api";
import { DateRangePicker } from "./date-range-picker";
import type { SummaryWidget } from "./dashboard.types";

const NAVY = "#1E2A6B";
const BLUE = "#4C7DF0";
const GREEN = "#5FDD98";

// Legacy DashboardFilter.getGreetings — exact hour thresholds.
function greetingKey(): string {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "greetingMorning";
  if (h >= 12 && h < 17) return "greetingAfternoon";
  if (h >= 17 && h < 20) return "greetingEvening";
  if (h >= 20 && h < 24) return "greetingNight";
  return "greetingDefault";
}

// Legacy index.js dateFormatter — yyyy-MM-dd.
const fmtApi = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const pctOf = (v: number) => Math.max(0, Math.min(100, Number(v) || 0));
const pctLabel = (v: number) => {
  const p = pctOf(v);
  return `${p % 1 === 0 ? p : p.toFixed(2)}%`;
};

/** The hero metric for a section (usually the total). */
function FeatureTile({
  w,
  rowSpan,
  onClick,
}: {
  w: SummaryWidget;
  rowSpan: number;
  onClick: (w: SummaryWidget) => void;
}) {
  const { t } = useTranslation("dashboard");
  const clickable = Boolean(w.route && w.count !== 0);
  const pct = pctOf(w.percentage);
  return (
    <div
      onClick={() => onClick(w)}
      className={`relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white ${
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
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {w.name}
        </p>
        {clickable && (
          <ArrowUpRight className="h-5 w-5 text-white/70 transition group-hover:text-white" />
        )}
      </div>

      {/* Center: big ring uses the empty vertical space */}
      <div className="relative flex flex-1 items-center justify-center py-4">
        <div className="relative aspect-square w-full max-w-[180px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="10"
            />
            {pct > 0 && (
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={(2 * Math.PI * 52) * (1 - pct / 100)}
                className="transition-[stroke-dashoffset] duration-700"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold leading-none tracking-tight">
              {w.count}
            </span>
            <span className="mt-1 text-xs font-semibold text-white/70">
              {pctLabel(w.percentage)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>{t("share")}</span>
          <span className="font-semibold text-white">
            {pctLabel(w.percentage)}
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

/** Compact metric tile with an inline progress meter. */
function MetricTile({
  w,
  accent,
  onClick,
}: {
  w: SummaryWidget;
  accent: string;
  onClick: (w: SummaryWidget) => void;
}) {
  const clickable = Boolean(w.route && w.count !== 0);
  const pct = pctOf(w.percentage);
  return (
    <div
      onClick={() => onClick(w)}
      className={`group flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-3.5 transition ${
        clickable ? "cursor-pointer hover:border-slate-200 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {w.name}
        </p>
        <span
          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
        {w.count}
      </p>
      <div className="mt-2.5">
        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%`, backgroundColor: accent }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] font-bold text-slate-600">
          {pctLabel(w.percentage)}
        </p>
      </div>
    </div>
  );
}

const ACCENTS = [BLUE, GREEN, NAVY, "#F59E0B", "#EC4899", "#06B6D4"];

function SummarySection({
  title,
  subtitle,
  items,
  loading,
  onCardClick,
}: {
  title: string;
  subtitle: string;
  items: SummaryWidget[];
  loading: boolean;
  onCardClick: (w: SummaryWidget) => void;
}) {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");
  const [feature, ...rest] = items;
  // 4-col grid, feature occupies 1 col → 3 cols remain for the rest.
  // Feature spans the full height of those rows.
  const featureRows = Math.max(1, Math.ceil(rest.length / 3));
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
          <span className="ms-2 text-sm font-normal text-slate-400">
            {subtitle}
          </span>
        </h3>
        {items.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            {t("metricsCount", { count: items.length })}
          </span>
        )}
      </div>

      {loading && items.length === 0 ? (
        <p className="text-sm text-slate-400">{tc("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">{t("noSummaryForPeriod")}</p>
      ) : (
        <div className="grid auto-rows-[1fr] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {feature && (
            <FeatureTile
              w={feature}
              rowSpan={featureRows}
              onClick={onCardClick}
            />
          )}
          {rest.map((w, i) => (
            <MetricTile
              key={`${w.name}-${i}`}
              w={w}
              accent={ACCENTS[i % ACCENTS.length]!}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function readBanner(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tenant);
    const tenant = raw ? JSON.parse(raw) : null;
    return tenant?.system?.other_data?.dashboard_banner ?? null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const resolved = useModule();
  const { t } = useTranslation("dashboard");

  const userName =
    (user?.username as string) ?? user?.name ?? user?.email ?? t("defaultUserName");

  // Legacy DashboardFilter: default = [today - lead_visibility(or 90), today];
  // minDate only when lead_visibility is set; maxDate = today.
  const { defFrom, defTo, minDate, maxDate } = useMemo(() => {
    const perm = resolved?.node.allowed_permission as
      | Record<string, unknown>
      | undefined;
    const hasLv = perm?.lead_visibility != null;
    const lv = Number(perm?.lead_visibility) || 90;
    const from = new Date();
    from.setDate(from.getDate() - lv);
    const min = hasLv ? new Date(from) : undefined;
    return { defFrom: from, defTo: new Date(), minDate: min, maxDate: new Date() };
  }, [resolved]);

  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: defFrom,
    to: defTo,
  });
  // Re-sync to defaults when the module permission resolves (legacy dateSet).
  useEffect(() => {
    setRange({ from: defFrom, to: defTo });
  }, [defFrom.getTime(), defTo.getTime()]);

  const exclude = (
    resolved?.node.configuration as Record<string, unknown> | undefined
  )?.exclude_journey_types as string | undefined;

  // Legacy filteredOutput: to_date sent = picked end + 1 day.
  const toPlusOne = useMemo(() => {
    const d = new Date(range.to);
    d.setDate(d.getDate() + 1);
    return d;
  }, [range.to]);

  const fromApi = fmtApi(range.from);
  const toApi = fmtApi(toPlusOne);

  // Query key includes the dates, so changing the picker auto-refetches.
  const { data, isFetching } = useDashboard({
    fromDate: fromApi,
    toDate: toApi,
    exclude,
    enabled: Boolean(fromApi && toApi),
  });

  const lead = data?.lead ?? [];
  const lender = data?.lender ?? [];
  // Banner kept available for tenants that configure one (legacy parity).
  void readBanner();

  const onCardClick = (w: SummaryWidget) => {
    if (w.route && w.count !== 0) {
      navigate(w.route, { state: { filterData: w.filter } });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Slim greeting bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <span className="text-lg text-slate-400">{t(greetingKey())}, </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {userName}
          </span>
        </div>
        <DateRangePicker
          value={range}
          onChange={setRange}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>

      {/* Lead wise summary (legacy Widgets — result.lead) */}
      <SummarySection
        title={t("leadWiseTitle")}
        subtitle={t("leadWiseSubtitle")}
        items={lead}
        loading={isFetching}
        onCardClick={onCardClick}
      />

      {/* Lender wise Summary (legacy — result.lender) */}
      {lender.length > 0 && (
        <hr className="border-slate-200" />
      )}
      {lender.length > 0 && (
        <SummarySection
          title={t("lenderWiseTitle")}
          subtitle={t("lenderWiseSubtitle")}
          items={lender}
          loading={isFetching}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
}
