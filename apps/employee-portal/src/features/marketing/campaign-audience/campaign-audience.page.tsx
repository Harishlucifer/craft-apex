import { useMemo, useState, type ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Inbox, ListFilter, Megaphone, Phone, User } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { DateRangeFields, useDateRange } from "@/components/report-shell";
import {
  ActiveFiltersStrip,
  type ActiveFilter,
} from "@/components/active-filters-strip";
import { useCampaignAudience } from "./campaign-audience.api";
import type {
  AudienceNotification,
  AudienceRow,
} from "./campaign-audience.types";

// Legacy AudienceListView.js status map (lines 119-128).
const STATUS_MAP: Record<number, { tone: "info" | "primary" | "success" | "warning" | "danger" | "secondary"; text: string }> = {
  [-1]: { tone: "danger", text: "Failed" },
  1: { tone: "info", text: "Created" },
  2: { tone: "primary", text: "Engaging" },
  3: { tone: "success", text: "Completed" },
  4: { tone: "warning", text: "Converted" },
};

// Backend `status` filter values — marketing/constants.go AudienceStatusToString.
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "1", label: "Created" },
  { value: "2", label: "Engaging" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Converted" },
  { value: "-1", label: "Failed" },
];

// Brand-accurate channel glyphs as inline SVGs (lucide ships only generic
// strokes). `fill="currentColor"` so they pick up the brand colour applied by
// the parent. Sized via the passed className.
type IconProps = { className?: string };

const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.738-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);

const PhoneCallIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const SmsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
  </svg>
);

const MailIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

// Per-channel branding for the communication icons. Brand colours mirror the
// legacy AudienceListView medium palette.
interface MediumMeta {
  label: string;
  color: string;
  Icon: ComponentType<{ className?: string }>;
}
const MEDIUM_META: Record<string, MediumMeta> = {
  WHATSAPP: { label: "WhatsApp", color: "#25D366", Icon: WhatsAppIcon },
  EMAIL: { label: "Email", color: "#F59E0B", Icon: MailIcon },
  CALL: { label: "Call", color: "#4C7DF0", Icon: PhoneCallIcon },
  SMS: { label: "SMS", color: "#8B5CF6", Icon: SmsIcon },
};
function getMediumMeta(medium?: string): MediumMeta {
  return (
    MEDIUM_META[(medium ?? "").toUpperCase()] ?? {
      label: medium || "—",
      color: "#64748b",
      Icon: Megaphone,
    }
  );
}

// Uploaded audiences store their values in `audience_data`, keyed by the raw
// upload-file column headers (arbitrary casing/spacing, e.g. "Customer Name",
// "Borrower Name", "Name of Applicant"). We resolve a logical field by:
//   1. substring match on the core token (handles unknown prefixes/suffixes),
//   2. exact normalized alias match (handles tokens without the core word),
// then fall back to the top-level fields the backend fills for associate rows.
const FIELD_TOKENS = {
  // Core substrings — any normalized key containing one of these matches.
  name: ["name"],
  mobile: ["mobile", "phone"],
} as const;

const FIELD_ALIASES = {
  name: ["customer", "applicant", "borrower", "contactperson", "candidate", "leadname"],
  mobile: ["contactnumber", "contactno", "mobileno", "phoneno", "contact", "msisdn"],
} as const;

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

function fromAudienceData(
  data: AudienceRow["audience_data"],
  field: keyof typeof FIELD_TOKENS
): string {
  if (!data) return "";
  const tokens = FIELD_TOKENS[field] as readonly string[];
  const aliases = FIELD_ALIASES[field] as readonly string[];
  for (const [key, value] of Object.entries(data)) {
    if (value == null || String(value).trim() === "") continue;
    const norm = normalizeKey(key);
    if (tokens.some((t) => norm.includes(t)) || aliases.includes(norm)) {
      return String(value);
    }
  }
  return "";
}

function firstNonEmpty(...values: (string | undefined)[]): string {
  for (const v of values) {
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function resolveMobile(row: AudienceRow): string {
  return firstNonEmpty(
    row.audience_data?.mobile,
    fromAudienceData(row.audience_data, "mobile"),
    row.mobile
  );
}

// Columns that are never a person's name — skipped by the last-resort guess.
const NON_NAME_KEY = /email|mail|mobile|phone|pincode|pin|amount|code|^id$|_id|date|status|loan|address|city|state|gender|dob|age|score|type|source|segment|otp|url|link/;

/**
 * Last-resort name guess: the first audience_data value that reads like a name
 * — has letters, isn't the row's mobile, isn't an email-ish value, isn't a
 * known non-name column, and isn't mostly digits. Keeps uploaded rows with
 * non-standard headers from showing "N/A".
 */
function firstNameLikeValue(
  data: AudienceRow["audience_data"],
  mobile: string
): string {
  if (!data) return "";
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    const s = String(value).trim();
    if (!s || s === mobile || s.includes("@")) continue;
    if (NON_NAME_KEY.test(normalizeKey(key))) continue;
    if (!/[a-zA-Z]/.test(s)) continue; // must contain letters
    const digits = (s.match(/\d/g) ?? []).length;
    if (digits > s.length / 2) continue; // mostly numeric → not a name
    return s;
  }
  return "";
}

function resolveName(row: AudienceRow): string {
  const direct = firstNonEmpty(
    row.audience_data?.name,
    fromAudienceData(row.audience_data, "name"),
    row.name
  );
  if (direct) return direct;
  return firstNameLikeValue(
    row.audience_data,
    resolveMobile(row)
  );
}

export default function CampaignAudiencePage() {
  const { id } = useParams<{ id: string }>();
  const dateRange = useDateRange();
  const [status, setStatus] = useState("");

  const { data: rows = [], isLoading, isFetching } = useCampaignAudience({
    campaignId: id,
    fromDate: dateRange.startDate || undefined,
    toDate: dateRange.endDate || undefined,
    status: status || undefined,
  });

  const hasServerFilters =
    Boolean(dateRange.startDate || dateRange.endDate || status);

  const clearServerFilters = () => {
    dateRange.reset();
    setStatus("");
  };

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const out: ActiveFilter[] = [];
    if (status) {
      const label =
        STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
      out.push({ label: "Status", value: label, onClear: () => setStatus("") });
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
    return out;
  }, [status, dateRange]);

  const filterFn = useMemo(
    () => (row: AudienceRow, q: string) => {
      const name = resolveName(row).toLowerCase();
      const mobile = resolveMobile(row).toLowerCase();
      return name.includes(q) || mobile.includes(q);
    },
    []
  );
  const list = useClientList(rows, filterFn);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campaign Audience
          </h1>
          <p className="text-sm text-slate-500">
            {list.total} {list.total === 1 ? "audience" : "audiences"}
            {id && (
              <>
                {" "}
                · campaign <span className="font-mono">{id}</span>
              </>
            )}
            {isFetching && !isLoading && (
              <span className="ml-2 text-xs text-slate-400">· updating…</span>
            )}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/marketing/campaign">
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
        </Button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label
              htmlFor="audience-search"
              className="flex items-center gap-1 text-xs font-medium text-slate-700"
            >
              <ListFilter className="h-3 w-3" />
              Search
            </Label>
            <Input
              id="audience-search"
              value={list.search}
              onChange={(e) => list.setSearch(e.target.value)}
              placeholder="Search by name or mobile…"
            />
          </div>

          <div className="w-44 space-y-1.5">
            <Label
              htmlFor="audience-status"
              className="flex items-center gap-1 text-xs font-medium text-slate-700"
            >
              <ListFilter className="h-3 w-3" />
              Status
            </Label>
            <select
              id="audience-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <DateRangeFields
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartChange={dateRange.setStartDate}
            onEndChange={dateRange.setEndDate}
            startLabel="From"
            endLabel="To"
          />

          {hasServerFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearServerFilters}
              className="text-slate-500"
            >
              Clear filters
            </Button>
          )}
        </div>

        <ActiveFiltersStrip
          filters={activeFilters}
          onClearAll={clearServerFilters}
        />
      </div>

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && list.total === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No audience yet"
        emptyDescription="Audience entries created by this campaign will appear here."
        columnCount={6}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Workflow Progress</TableHead>
            <TableHead>Last Communication</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        }
        pagination={{
          page: list.page,
          totalPages: list.totalPages,
          total: list.total,
          pageSize: list.pageSize,
          onPageChange: list.setPage,
          onPageSizeChange: list.setPageSize,
        }}
      >
        {list.paged.map((row) => (
          <TableRow key={String(row.audience_id ?? `${row.email}-${row.mobile}`)}>
            <TableCell>
              <CustomerCell row={row} />
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.campaign?.name ?? "—"}
            </TableCell>
            <TableCell>
              <WorkflowProgress notifications={row.notifications ?? []} />
            </TableCell>
            <TableCell>
              <LastCommunication
                notifications={row.notifications ?? []}
                updatedAt={row.updated_at}
              />
            </TableCell>
            <TableCell>
              <Engagement notifications={row.notifications ?? []} />
            </TableCell>
            <TableCell>
              <StatusBadge row={row} />
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}

// Soft avatar gradients — picked deterministically from the name so a given
// customer always gets the same colour.
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4C7DF0, #1E2A6B)",
  "linear-gradient(135deg, #25D366, #128C4B)",
  "linear-gradient(135deg, #FF6B35, #E04F1C)",
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #06B6D4, #0E7490)",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]!;
}

function CustomerCell({ row }: { row: AudienceRow }) {
  const name = resolveName(row) || "N/A";
  const mobile = resolveMobile(row) || "N/A";
  const hasName = name !== "N/A";
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
        style={{ background: hasName ? gradientFor(name) : "#cbd5e1" }}
        aria-hidden
      >
        {getInitials(name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="inline-flex items-center gap-1.5 truncate text-sm font-semibold capitalize text-slate-900">
          <User className="h-3 w-3 shrink-0 text-slate-400" />
          {name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full"
            style={{ backgroundColor: "#4C7DF01f", color: "#4C7DF0" }}
          >
            <Phone className="h-2.5 w-2.5" />
          </span>
          {mobile}
        </span>
      </div>
    </div>
  );
}

function WorkflowProgress({ notifications }: { notifications: AudienceNotification[] }) {
  if (notifications.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const sent = notifications.filter((n) => n.status === 1).length;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        {notifications.map((n, i) => (
          <NotificationDot key={i} notification={n} />
        ))}
      </div>
      <span className="text-[11px] font-medium text-slate-500">
        {sent} of {notifications.length} sent
      </span>
    </div>
  );
}

function NotificationDot({ notification }: { notification: AudienceNotification }) {
  const medium = notification.medium?.[0] ?? "";
  const meta = getMediumMeta(medium);
  const isSent = notification.status === 1;
  const isFailed = notification.status === -1;
  const stateLabel = isSent ? "Sent" : isFailed ? "Failed" : "Pending";
  const title = `${meta.label} · ${stateLabel}`;

  // Sent dots are solid brand-coloured badges (white glyph) so they read like
  // the real app logo; failed is solid red; pending is a soft dashed outline.
  const style = isSent
    ? {
        color: "#ffffff",
        background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
        borderColor: meta.color,
        borderStyle: "solid" as const,
        boxShadow: `0 2px 6px -1px ${meta.color}66`,
      }
    : isFailed
      ? {
          color: "#ffffff",
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          borderColor: "#ef4444",
          borderStyle: "solid" as const,
          boxShadow: "0 2px 6px -1px #ef444466",
        }
      : {
          color: "#94a3b8",
          backgroundColor: "transparent",
          borderColor: "#cbd5e1",
          borderStyle: "dashed" as const,
        };

  const { Icon } = meta;
  return (
    <span
      title={title}
      style={style}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function LastCommunication({
  notifications,
  updatedAt,
}: {
  notifications: AudienceNotification[];
  updatedAt?: string;
}) {
  if (notifications.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const last = notifications[notifications.length - 1];
  const meta = getMediumMeta(last?.medium?.[0]);
  const { Icon } = meta;
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
        >
          <Icon className="h-3 w-3" />
        </span>
        <span style={{ color: meta.color }}>{meta.label}</span>
      </span>
      <span className="text-[11px] text-slate-500">
        {formatDate(updatedAt) ?? "—"}
      </span>
    </div>
  );
}

function Engagement({ notifications }: { notifications: AudienceNotification[] }) {
  const channels = Array.from(
    new Set(notifications.flatMap((n) => n.medium ?? []))
  );
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-700">
        {notifications.length}{" "}
        <span className="font-normal text-slate-500">comms</span>
      </span>
      {channels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {channels.map((channel) => {
            const meta = getMediumMeta(channel);
            const { Icon } = meta;
            return (
              <span
                key={channel}
                title={meta.label}
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
              >
                <Icon className="h-2.5 w-2.5" />
                {meta.label}
              </span>
            );
          })}
        </div>
      ) : (
        <span className="text-[11px] text-slate-500">—</span>
      )}
    </div>
  );
}

function StatusBadge({ row }: { row: AudienceRow }) {
  const entry =
    (row.status != null && STATUS_MAP[row.status]) || {
      tone: "secondary" as const,
      text: row.audience_status ?? "Unknown",
    };
  const text = row.audience_status ?? entry.text;
  const variantClass =
    entry.tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : entry.tone === "danger"
        ? "bg-rose-100 text-rose-700"
        : entry.tone === "warning"
          ? "bg-amber-100 text-amber-700"
          : entry.tone === "primary"
            ? "bg-indigo-100 text-indigo-700"
            : entry.tone === "info"
              ? "bg-sky-100 text-sky-700"
              : "bg-slate-100 text-slate-700";
  return (
    <Badge className={`text-[10px] uppercase tracking-wide ${variantClass}`}>
      {text}
    </Badge>
  );
}

function formatDate(s?: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
