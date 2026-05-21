import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Inbox, Mail, MessageSquare, Phone, Smartphone } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
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

export default function CampaignAudiencePage() {
  const { id } = useParams<{ id: string }>();
  const { data: rows = [], isLoading } = useCampaignAudience({ campaignId: id });

  const filterFn = useMemo(
    () => (row: AudienceRow, q: string) => {
      const name = (row.audience_data?.name ?? row.name ?? "").toLowerCase();
      const email = (row.audience_data?.contact_email ?? row.email ?? "").toLowerCase();
      const mobile = (row.audience_data?.mobile ?? row.mobile ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q);
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
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/marketing/campaign">
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search by name, email, mobile…"
          className="max-w-xs"
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

function CustomerCell({ row }: { row: AudienceRow }) {
  const name = row.audience_data?.name ?? row.name ?? "N/A";
  const email = row.audience_data?.contact_email ?? row.email ?? "N/A";
  const mobile = row.audience_data?.mobile ?? row.mobile ?? "N/A";
  return (
    <div className="flex flex-col py-1">
      <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
      <span className="text-xs text-slate-500">
        <Mail className="mr-1 inline h-3 w-3" />
        {email}
      </span>
      <span className="text-xs text-slate-500">
        <Phone className="mr-1 inline h-3 w-3" />
        {mobile}
      </span>
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
  const isSent = notification.status === 1;
  const isFailed = notification.status === -1;
  const title = `${medium} · ${isSent ? "Sent" : isFailed ? "Failed" : "Pending"}`;
  const classes = isSent
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isFailed
      ? "border-rose-500 bg-rose-500 text-white"
      : "border-slate-200 bg-transparent text-slate-500";
  return (
    <span
      title={title}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${classes}`}
    >
      <MediumIcon medium={medium} />
    </span>
  );
}

function MediumIcon({ medium }: { medium: string }) {
  switch (medium?.toUpperCase()) {
    case "WHATSAPP":
      return <MessageSquare className="h-3 w-3" />;
    case "EMAIL":
      return <Mail className="h-3 w-3" />;
    case "CALL":
      return <Phone className="h-3 w-3" />;
    case "SMS":
      return <Smartphone className="h-3 w-3" />;
    default:
      return <span className="text-[10px] font-medium">•</span>;
  }
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
  const medium = last?.medium?.[0] ?? "—";
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
        <MediumIcon medium={medium} /> {medium}
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
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-slate-700">
        {notifications.length}{" "}
        <span className="font-normal text-slate-500">comms</span>
      </span>
      <span className="text-[11px] text-slate-500">
        {channels.length > 0 ? channels.join(", ") : "—"}
      </span>
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
