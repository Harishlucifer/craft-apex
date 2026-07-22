import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Badge, TableCell, TableHead, TableRow, Button } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useChannelList } from "./channel-list.api";

const PAGE_SIZE = 10;

// Legacy partnerRegistrationStatus + partnerJourneyType.
// Each route is a thin wrapper passing these filters to ChannelList.
const PARTNER = "FULL_FLEDGED_PARTNER|SIMPLE_PARTNER_ONBOARD";
const PARTNER_APPROVED = "FULL_FLEDGED_PARTNER";
const VENDOR = "FULL_FLEDGED_VENDOR";
const APF = "FULL_FLEDGED_APF";

const PATH_FILTERS: Record<
  string,
  { status: string; journeyType: string; partnerType: "Partner" | "Vendor" | "Apf" }
> = {
  // PARTNER
  "/partner/onboarding/in-progress": { status: "1", journeyType: PARTNER, partnerType: "Partner" },
  "/partner/onboarding/pending": { status: "2|4", journeyType: PARTNER, partnerType: "Partner" },
  "/partner/onboarding/approved": { status: "3", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  "/partner/onboarding/rejected": { status: "-1", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  "/partner/onboarding/archived": { status: "-2", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  "/partner/onboarding/inactive": { status: "-3", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  // BC partner (same filters as /partner/onboarding/*)
  "/bc/partner/onboarding/in-progress": { status: "1", journeyType: PARTNER, partnerType: "Partner" },
  "/bc/partner/onboarding/pending": { status: "2|4", journeyType: PARTNER, partnerType: "Partner" },
  "/bc/partner/onboarding/approved": { status: "3", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  "/bc/partner/onboarding/rejected": { status: "-1", journeyType: PARTNER_APPROVED, partnerType: "Partner" },
  // VENDOR
  "/vendor/onboarding/in-progress": { status: "1", journeyType: VENDOR, partnerType: "Vendor" },
  "/vendor/onboarding/pending": { status: "2|4", journeyType: VENDOR, partnerType: "Vendor" },
  "/vendor/onboarding/approved": { status: "3", journeyType: VENDOR, partnerType: "Vendor" },
  "/vendor/onboarding/rejected": { status: "-1", journeyType: VENDOR, partnerType: "Vendor" },
  // COLLECTION VENDOR (same as vendor)
  "/collection/vendor/onboarding/in-progress": { status: "1", journeyType: VENDOR, partnerType: "Vendor" },
  "/collection/vendor/onboarding/pending": { status: "2|4", journeyType: VENDOR, partnerType: "Vendor" },
  "/collection/vendor/onboarding/approved": { status: "3", journeyType: VENDOR, partnerType: "Vendor" },
  "/collection/vendor/onboarding/rejected": { status: "-1", journeyType: VENDOR, partnerType: "Vendor" },
  // APF
  "/apf/onboarding/in-progress": { status: "1", journeyType: APF, partnerType: "Apf" },
  "/apf/onboarding/pending": { status: "2|4", journeyType: APF, partnerType: "Apf" },
  "/apf/onboarding/approved": { status: "3", journeyType: APF, partnerType: "Apf" },
  "/apf/onboarding/rejected": { status: "-1", journeyType: APF, partnerType: "Apf" },
};

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

function statusLabel(s: number | string | undefined): {
  label: string;
  variant: "success" | "warning" | "destructive" | "secondary";
} {
  const n = typeof s === "string" ? Number(s) : s;
  if (n === 3) return { label: "Approved", variant: "success" };
  if (n === 1) return { label: "In Progress", variant: "warning" };
  if (n === 2 || n === 4) return { label: "Pending Approval", variant: "warning" };
  if (n === -1) return { label: "Rejected", variant: "destructive" };
  if (n === -2) return { label: "Archived", variant: "secondary" };
  if (n === -3) return { label: "Inactive", variant: "destructive" };
  return { label: String(s ?? "—"), variant: "secondary" };
}

export default function ChannelListPage() {
  const { pathname } = useLocation();
  const cfg = PATH_FILTERS[pathname];
  const [page, setPage] = useState(1);

  const { data, isFetching } = useChannelList({
    status: cfg?.status ?? "",
    page,
    journeyType: cfg?.journeyType,
    enabled: Boolean(cfg),
  });

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={9}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle={
        cfg
          ? `No ${cfg.partnerType.toLowerCase()}s in this list`
          : "Unknown channel list"
      }
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>Code</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Enterprise Type</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Contact</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Journey</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Actions</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => {
        const s = statusLabel(r.status);
        const editPrefix = pathname.replace(/\/(in-progress|pending|approved|rejected|archived|inactive)$/, "");
        return (
          <TableRow
            key={`${String(r.channel_id ?? r.dsa_code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs">
              {r.dsa_code ?? "—"}
            </TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.partner_category ?? "—"}</TableCell>
            <TableCell>{r.onb_territory_name ?? "—"}</TableCell>
            <TableCell>
              <div>{r.point_of_contact ?? "—"}</div>
              <div className="text-[11px] text-slate-400">
                {r.mobile ?? ""}
              </div>
            </TableCell>
            <TableCell className="text-xs">{r.journey_type ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={s.variant}>{s.label}</Badge>
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.createdAt)}
            </TableCell>
            <TableCell>
              <Button asChild variant="outline" size="sm" className="h-7 px-3 border-slate-200 text-slate-600 hover:text-slate-800">
                <Link to={`${editPrefix}/${r.channel_id ?? ""}`}>Edit</Link>
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </DataTableShell>
  );
}
