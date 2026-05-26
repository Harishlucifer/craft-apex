import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useLenderGstList } from "./lender-gst.api";
import type { LenderGstRow } from "./lender-gst.types";

const PAGE_SIZE = 10;

// DEFERRED (legacy parity): "Add GST" / "Edit GST" modal — legacy file opens
// a reactstrap <Modal> rendering <GstModal> (PayableReceivableManagement/Gst/
// GstModal.js) with a Formik form for gstNo, address, isMainBranch, pincode
// lookups (corePincodeList chain) and Save/Update against the same endpoint.
// Port the modal in a follow-up — the list is shipped this round.

// Legacy: Boolean column inversion — `(value ? "No" : "Yes")` because
// `isMainBranch` represents *branch* (true = branch office = not head office).
function isHeadOfficeText(value?: boolean | 0 | 1) {
  return value ? "No" : "Yes";
}

// Legacy global filter is a substring match across all visible accessor values.
function matchRow(row: LenderGstRow, q: string) {
  if (!q) return true;
  const haystack = [
    row.gstNo,
    row.corePincodeList?.coreCityList?.coreStateList?.name,
    row.corePincodeList?.pincode,
    row.address,
    row.corePincodeList?.area,
    row.corePincodeList?.coreCityList?.name,
  ]
    .map((v) => String(v ?? "").toLowerCase())
    .join(" ");
  return haystack.includes(q.toLowerCase());
}

export default function LenderGstPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useLenderGstList();
  const allRows = data?.data ?? [];

  const filtered = useMemo(
    () => allRows.filter((r) => matchRow(r, keyword)),
    [allRows, keyword],
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            Lender Gst Details
          </h1>
          <p className="text-sm text-slate-500">
            Active GST registrations for the lender. {total}{" "}
            {total === 1 ? "record" : "records"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          {/* DEFERRED: opens legacy GstModal — see top-of-file note. */}
          <Button size="sm" disabled title="Add GST modal not yet ported">
            <Plus className="h-4 w-4" /> Add GST
          </Button>
        </div>
      </div>

      <form onSubmit={onSearchSubmit} className="flex max-w-md items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
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

      {/* Columns mirror legacy `columns` useMemo verbatim:
          GSTN, State, Pincode, Address, Area, District, Is Head Office,
          Status, Actions. */}
      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && pageRows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No GST records"
        emptyDescription="Active lender GST registrations will appear here."
        columnCount={9}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead>GSTN</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Pincode</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Is Head Office</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
        {pageRows.map((row, i) => {
          const isActive = row.status === 1;
          return (
            <TableRow key={String(row.id ?? `lgst-${i}`)}>
              <TableCell className="font-mono text-sm text-slate-900">
                {row.gstNo ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.corePincodeList?.coreCityList?.coreStateList?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.corePincodeList?.pincode ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.address ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.corePincodeList?.area ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.corePincodeList?.coreCityList?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {isHeadOfficeText(row.isMainBranch)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    isActive
                      ? "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                      : "bg-rose-100 text-[10px] uppercase tracking-wide text-rose-700"
                  }
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* DEFERRED: opens legacy GstModal pre-filled with row.id. */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled
                  title="Edit GST modal not yet ported"
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
