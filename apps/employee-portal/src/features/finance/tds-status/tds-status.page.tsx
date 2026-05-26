import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useVendorTdsStatusList } from "./tds-status.api";

const PAGE_SIZE = 10;

// Legacy hard-coded TDS columns from VendorTDSStatus.js — preserved verbatim.
const TDS_STATUS_LABEL = "Standard";
const TDS_RATE_LABEL = "5%";
const APPROVED_DATE_LABEL = "15/05/2025";
const VALID_TILL_LABEL = "20/06/2028";

export default function TdsStatusPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useVendorTdsStatusList(page, keyword);
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
            TDS Vendor Status
          </h1>
          <p className="text-sm text-slate-500">
            Approved vendors with their TDS status. {total}{" "}
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
          placeholder="Search vendor name, code…"
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

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No TDS status records"
        emptyDescription="Approved vendors will appear here."
        columnCount={12}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead>Vendor Code</TableHead>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Onboarding Territory</TableHead>
            <TableHead>RM Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>TDS Status</TableHead>
            <TableHead>TDS Rate</TableHead>
            <TableHead>Approved Date</TableHead>
            <TableHead>Valid Till</TableHead>
            <TableHead className="w-16">Action</TableHead>
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
        {rows.map((row, i) => (
          <TableRow key={String(row.channel_id ?? `${row.dsa_code}-${i}`)}>
            <TableCell className="font-mono text-xs text-slate-700">
              {row.dsa_code ?? "—"}
            </TableCell>
            <TableCell className="text-sm font-semibold text-slate-900">
              {row.name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.point_of_contact ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.mobile ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.onb_territory_name ?? "—"}
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
              {TDS_STATUS_LABEL}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {TDS_RATE_LABEL}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {APPROVED_DATE_LABEL}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {VALID_TILL_LABEL}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                disabled={row.channel_id == null}
                onClick={() => {
                  if (row.channel_id != null) {
                    navigate(`/partner/onboarding/approved/${row.channel_id}`);
                  }
                }}
              >
                <Eye className="h-4 w-4" /> View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
