import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Inbox } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useVendorGstList } from "./vendor-gst.api";

const PAGE_SIZE = 10;

// DEFERRED (legacy parity): "Update GST Status" modal — legacy file opens a
// reactstrap <Modal> with a Formik form (gstStatus + noteCode + remarks) that
// chains GET /alpha/v1/partner/:channelId → POST /alpha/v1/partner/create →
// POST /alpha/v1/core/note (legacy APIENDPOINTS.PARTNER_DATA_FETCH /
// PARTNER_CREATE / POST_NOTE). Lookup for the gstStatus dropdown comes from
// GET /alpha/v1/lookup?group_code=GST_STATUS, and the noteCode options come
// from the constants module (gstNoteSubCode, noteScope.partnerFlow). Port the
// modal in a follow-up — the list + filters are shipped this round.

function formatLegacyDate(raw?: string) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  // Legacy: `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

export default function VendorGstPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useVendorGstList(page, keyword);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(search.trim());
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor GST
          </h1>
          <p className="text-sm text-slate-500">
            Approved channels with their GST defaulter status. {total}{" "}
            {total === 1 ? "vendor" : "vendors"}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form onSubmit={onSearchSubmit} className="flex max-w-md items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search...."
        />
        <Button type="submit" size="sm">
          Search
        </Button>
        {keyword && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setKeyword("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Columns mirror legacy `columns` useMemo (S.No, Name, Enterprise Type,
          Onboarding Territory, Contact Person Name, Contact Person Mobile, RM
          Name, Status, Date, GST Status, Action). */}
      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No data found"
        emptyDescription="Approved vendors will appear here."
        columnCount={11}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Enterprise Type</TableHead>
            <TableHead>Onboarding Territory</TableHead>
            <TableHead>Contact Person Name</TableHead>
            <TableHead>Contact Person Mobile</TableHead>
            <TableHead>RM Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>GST Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        }
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
      >
        {rows.map((row, i) => {
          const isDefaulter = row.is_gst_defaulter === 1;
          return (
            <TableRow key={String(row.channel_id ?? `vgst-${i}`)}>
              <TableCell className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + i + 1}
              </TableCell>
              <TableCell className="text-sm font-semibold text-slate-900">
                {row.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.partner_category ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.onb_territory_name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.point_of_contact ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.mobile ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.relationship_manager?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge className="bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700">
                  {row.status_name ?? "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {formatLegacyDate(row.created_at)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    isDefaulter
                      ? "bg-rose-100 text-[10px] uppercase tracking-wide text-rose-700"
                      : "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                  }
                >
                  {isDefaulter ? "Defaulter" : "Regularise"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* DEFERRED: "Update GST Status" dropdown action — see top-of-file
                    note. The legacy "View" action navigates to
                    /partner/onboarding/approved/:channel_id, which lives in a
                    different module and isn't ported yet, so render disabled. */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled
                  title="Vendor detail view not yet ported"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
