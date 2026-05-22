import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Inbox,
  LayoutGrid,
  ListFilter,
  Megaphone,
  Users,
} from "lucide-react";
import { useModule } from "@craft-apex/layout";
import { Badge, Button, Input } from "@craft-apex/ui";
import {
  DateRangeFields,
  ReportShell,
  useDateRange,
} from "@/components/report-shell";
import {
  ActiveFiltersStrip,
  type ActiveFilter,
} from "@/components/active-filters-strip";
import { useCampaignSummary } from "./campaign-summary.api";
import type { CampaignSummary } from "./campaign-summary.types";

/**
 * Marketing Campaign Summary dashboard. Legacy
 * /pages/Marketing/CampaignMgmt/CampaignSummary.js (508 LOC) renders
 * filter pills + status tabs + clickable campaign cards. We reuse the Phase 6
 * report scaffold for the chrome and render the campaign cards in a grid.
 *
 * Attribution defaults to APPLICATION|PARTNER. When the route is
 * /collection/* it's COLLECTION only (mirrors legacy `routeAttribution`).
 */

const STATUS_TABS = [
  { key: "all", label: "All", statusFilter: undefined as number | undefined },
  { key: "active", label: "Active", statusFilter: 1 },
  { key: "published", label: "Published", statusFilter: 2 },
  { key: "inactive", label: "Inactive", statusFilter: -1 },
];

const DATA_SOURCE_OPTIONS = [
  { value: "all", label: "All Audiences" },
  { value: "UPLOAD", label: "Upload" },
  { value: "EXISTING", label: "Existing" },
];

function statusBadge(status?: number): {
  label: string;
  className: string;
} {
  switch (status) {
    case 1:
      return { label: "Active", className: "bg-emerald-100 text-emerald-700" };
    case 2:
      return { label: "Published", className: "bg-sky-100 text-sky-700" };
    case -1:
      return { label: "Inactive", className: "bg-slate-100 text-slate-600" };
    default:
      return { label: "—", className: "bg-slate-100 text-slate-500" };
  }
}

export default function CampaignSummaryPage() {
  const module = useModule();
  const location = useLocation();
  const navigate = useNavigate();
  const moduleUrl = (module?.node.url ?? "").toLowerCase();
  const isCollection =
    moduleUrl.includes("collection") ||
    location.pathname.toLowerCase().includes("collection");
  const attribution = isCollection ? "COLLECTION" : "APPLICATION|PARTNER";
  const basePath = isCollection ? "/collection/campaign" : "/marketing/campaign";

  const dateRange = useDateRange();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dataSource, setDataSource] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filter = useMemo(
    () => ({
      attribution,
      status: activeTab === "all" ? undefined : String(activeTab),
      dataSource: dataSource === "all" ? undefined : dataSource,
      from: dateRange.startDate || undefined,
      to: dateRange.endDate || undefined,
    }),
    [attribution, activeTab, dataSource, dateRange.startDate, dateRange.endDate]
  );

  const { data, isFetching } = useCampaignSummary(filter);
  const campaigns = data?.campaigns ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        String(c.campaign_id ?? "").includes(q)
    );
  }, [campaigns, search]);

  const totalAudiences = useMemo(
    () =>
      campaigns.reduce((sum, c) => sum + (c.audiences?.length ?? 0), 0),
    [campaigns]
  );

  // Active filter chips (skip the implied "all" tab — that's the default).
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const out: ActiveFilter[] = [];
    if (activeTab !== "all") {
      const label =
        STATUS_TABS.find((t) => t.key === activeTab)?.label ?? activeTab;
      out.push({ label: "Status", value: label, onClear: () => setActiveTab("all") });
    }
    if (dataSource !== "all") {
      const opt = DATA_SOURCE_OPTIONS.find((o) => o.value === dataSource);
      out.push({
        label: "Audience",
        value: opt?.label ?? dataSource,
        onClear: () => setDataSource("all"),
      });
    }
    if (dateRange.startDate) {
      out.push({
        label: "From",
        value: dateRange.startDate,
        onClear: () => dateRange.setStartDate(""),
      });
    }
    if (dateRange.endDate) {
      out.push({
        label: "To",
        value: dateRange.endDate,
        onClear: () => dateRange.setEndDate(""),
      });
    }
    if (search.trim()) {
      out.push({ label: "Search", value: search.trim(), onClear: () => setSearch("") });
    }
    return out;
  }, [activeTab, dataSource, dateRange, search]);

  return (
    <ReportShell
      title="Campaign Summary"
      description={`${filtered.length} ${
        filtered.length === 1 ? "campaign" : "campaigns"
      } · ${totalAudiences} audiences`}
      backTo={basePath}
      searchLoading={isFetching && campaigns.length === 0}
      onSearch={() => {
        /* React Query refetches via filter change automatically */
      }}
      onReset={() => {
        setActiveTab("all");
        setDataSource("all");
        dateRange.reset();
        setSearch("");
      }}
      headerExtras={
        <div className="space-y-3">
          <StatusTabs activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by campaign name or ID…"
              />
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={basePath}>
                <ArrowLeft className="h-4 w-4" /> All Campaigns
              </Link>
            </Button>
          </div>
          <ActiveFiltersStrip
            filters={activeFilters}
            onClearAll={() => {
              setActiveTab("all");
              setDataSource("all");
              dateRange.reset();
              setSearch("");
            }}
          />
        </div>
      }
      filters={
        <>
          <DateRangeFields
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartChange={dateRange.setStartDate}
            onEndChange={dateRange.setEndDate}
            startLabel="From"
            endLabel="To"
          />
          <div className="space-y-1.5">
            <label
              className="flex items-center gap-1 text-xs font-medium text-slate-700"
              htmlFor="campaign-summary-data-source"
            >
              <ListFilter className="h-3 w-3" />
              Audience type
            </label>
            <select
              id="campaign-summary-data-source"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            >
              {DATA_SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </>
      }
    >
      {isFetching && campaigns.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-12 text-sm text-slate-500">
          <Inbox className="h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-600">No campaigns match these filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CampaignCard
              key={String(c.campaign_id ?? c.name)}
              campaign={c}
              onClick={() => navigate(`${basePath}/${c.campaign_id}`)}
            />
          ))}
        </div>
      )}
    </ReportShell>
  );
}

function StatusTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={
            activeTab === tab.key
              ? "inline-flex items-center gap-1.5 rounded-md bg-[#4C7DF0] px-3 py-1.5 text-xs font-semibold text-white"
              : "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
          }
        >
          {tab.key === "all" ? (
            <LayoutGrid className="h-3 w-3" />
          ) : (
            <Megaphone className="h-3 w-3" />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function CampaignCard({
  campaign,
  onClick,
}: {
  campaign: CampaignSummary;
  onClick: () => void;
}) {
  const status = statusBadge(campaign.status);
  const audienceCount = campaign.audiences?.length ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#4C7DF0] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {campaign.name ?? "—"}
          </h3>
          <span className="font-mono text-[11px] text-slate-400">
            ID: {String(campaign.campaign_id ?? "—")}
          </span>
        </div>
        <Badge className={`text-[10px] uppercase tracking-wide ${status.className}`}>
          {status.label}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {audienceCount} {audienceCount === 1 ? "audience" : "audiences"}
        </div>
        {campaign.data_source && (
          <Badge variant="outline" className="self-start text-[10px]">
            {campaign.data_source}
          </Badge>
        )}
      </div>
      {campaign.description && (
        <p className="line-clamp-2 text-xs text-slate-500">
          {campaign.description}
        </p>
      )}
    </button>
  );
}
