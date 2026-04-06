import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSetupStore, axiosInstance } from "@craft-apex/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@craft-apex/ui/components/card";
import {
  CalendarDays,
  ChevronRight,
  TrendingUp,
  Users,
  Building2,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Sun,
  Sunrise,
  Moon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface SummaryItem {
  name: string;
  count: number;
  percentage: number;
  route: string;
  filter: Record<string, unknown> | null;
}

interface DashboardSummaryResponse {
  result: {
    lead: SummaryItem[];
    lender: SummaryItem[];
  };
}

/* ------------------------------------------------------------------ */
/*  Helper – time-of-day greeting                                      */
/* ------------------------------------------------------------------ */

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="h-5 w-5 text-amber-500" /> };
  if (hour < 17) return { text: "Good Afternoon", icon: <Sun className="h-5 w-5 text-orange-500" /> };
  return { text: "Good Evening", icon: <Moon className="h-5 w-5 text-indigo-500" /> };
}

/* ------------------------------------------------------------------ */
/*  Helper – format date for API (YYYY-MM-DD)                          */
/* ------------------------------------------------------------------ */

function formatDateAPI(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Circular Progress Ring                                             */
/* ------------------------------------------------------------------ */

function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 4,
  color = "#2d5483",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-600">
          {percentage.toFixed(percentage % 1 === 0 ? 0 : 1)}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Metric Card                                                */
/* ------------------------------------------------------------------ */

function MetricCard({
  item,
  index,
  accentColor,
  onNavigate,
}: {
  item: SummaryItem;
  index: number;
  accentColor: string;
  onNavigate: (route: string, filter: Record<string, unknown> | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.route, item.filter)}
      className="group relative flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-[1px]"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all duration-200 group-hover:top-2 group-hover:bottom-2"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 pl-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate">
          {item.name}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">
          {item.count.toLocaleString()}
        </p>
      </div>

      {/* Progress ring */}
      <div className="shrink-0">
        <ProgressRing percentage={item.percentage} color={accentColor} />
      </div>

      {/* Hover arrow */}
      <ArrowUpRight className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, tenant } = useSetupStore();

  // Default date range: last 90 days
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 90);

  const [fromDate, setFromDate] = useState(formatDateAPI(defaultFrom));
  const [toDate, setToDate] = useState(formatDateAPI(defaultTo));

  const greeting = useMemo(() => getGreeting(), []);

  // Fetch dashboard summary
  const {
    data: summary,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<DashboardSummaryResponse>({
    queryKey: ["dashboard-summary", fromDate, toDate],
    queryFn: async () => {
      const res = await axiosInstance.get("/alpha/v1/dashboard/summary", {
        params: { from_date: fromDate, to_date: toDate },
      });
      return res.data as DashboardSummaryResponse;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const leadItems = summary?.result?.lead ?? [];
  const lenderItems = summary?.result?.lender ?? [];

  // Color palettes for cards
  const leadColors = [
    "#2d5483", "#3b82f6", "#6366f1", "#8b5cf6",
    "#ec4899", "#f59e0b", "#10b981", "#ef4444",
    "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  ];
  const lenderColors = [
    "#059669", "#0ea5e9", "#8b5cf6", "#f59e0b",
    "#ef4444", "#ec4899", "#6366f1", "#14b8a6",
    "#f97316", "#3b82f6", "#84cc16", "#2d5483",
  ];

  const handleNavigate = (
    route: string,
    filter: Record<string, unknown> | null
  ) => {
    if (!route) return;
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          params.set(key, String(val));
        }
      });
    }
    const queryString = params.toString();
    navigate(queryString ? `${route}?${queryString}` : route);
  };

  // Top-level stats from lead data
  const totalLeads = leadItems.find((i) => i.name.toLowerCase().includes("total"));
  const leadTotal = totalLeads?.count ?? leadItems.reduce((s, i) => s + i.count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* ═══════════════ Greeting + Date Range ═══════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {greeting.icon}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {greeting.text}, {user?.username ?? "User"}!
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Here&apos;s your dashboard overview
            </p>
          </div>
        </div>

        {/* Date range controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-none bg-transparent text-xs text-slate-600 outline-none"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-none bg-transparent text-xs text-slate-600 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════ Quick Stats Strip ═══════════════ */}
      {!isLoading && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 shadow-md shadow-blue-500/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">Total Leads</p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {leadTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 shadow-md shadow-emerald-500/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-100">
                Lead Categories
              </p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {leadItems.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-4 shadow-md shadow-violet-500/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-violet-100">
                Lender Stages
              </p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {lenderItems.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Loading State ═══════════════ */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-400">Loading dashboard data…</p>
          </div>
        </div>
      )}

      {/* ═══════════════ Lead Summary ═══════════════ */}
      {!isLoading && leadItems.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base">Lead Summary</CardTitle>
              </div>
              <span className="text-xs text-slate-400">
                {formatDateDisplay(new Date(fromDate))} →{" "}
                {formatDateDisplay(new Date(toDate))}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {leadItems.map((item, idx) => (
                <MetricCard
                  key={item.name}
                  item={item}
                  index={idx}
                  accentColor={leadColors[idx % leadColors.length]!}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════ Lender Summary ═══════════════ */}
      {!isLoading && lenderItems.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-base">Lender Summary</CardTitle>
              </div>
              <span className="text-xs text-slate-400">
                {formatDateDisplay(new Date(fromDate))} →{" "}
                {formatDateDisplay(new Date(toDate))}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {lenderItems.map((item, idx) => (
                <MetricCard
                  key={item.name}
                  item={item}
                  index={idx}
                  accentColor={lenderColors[idx % lenderColors.length]!}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
