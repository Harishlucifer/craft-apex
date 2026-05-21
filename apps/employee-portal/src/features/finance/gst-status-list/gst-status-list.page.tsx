import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useGstStatusList } from "./gst-status-list.api";

const PAGE_SIZE = 10;

// Legacy channelStatusLabel — only the values used here for Approved partners.
function statusLabel(status?: number | string) {
  const s = String(status ?? "");
  if (s === "3") return { text: "Approved", tone: "success" as const };
  if (s === "2" || s === "4") return { text: "Approval Pending", tone: "warning" as const };
  if (s === "1") return { text: "In Progress", tone: "info" as const };
  if (s === "-1") return { text: "Rejected", tone: "danger" as const };
  return { text: "—", tone: "secondary" as const };
}

const TONE_CLASS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  danger: "bg-rose-100 text-rose-700",
  secondary: "bg-slate-100 text-slate-700",
};

export default function GstStatusListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useGstStatusList(page, keyword);
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
            GST Status
          </h1>
          <p className="text-sm text-slate-500">
            Approved channels with their GST defaulter status. {total}{" "}
            {total === 1 ? "channel" : "channels"}.
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
        emptyTitle="No GST status records"
        emptyDescription="Approved channels will appear here."
        columnCount={8}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Territory</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>RM</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>GST</TableHead>
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
          const status = statusLabel(row.status);
          const isDefaulter = row.is_gst_defaulter === 1;
          return (
            <TableRow key={String(row.channel_id ?? `${row.dsa_code}-${i}`)}>
              <TableCell className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + i + 1}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    {row.name ?? "—"}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {row.dsa_code ?? "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.partner_category ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.onb_territory_name ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700">
                    {row.point_of_contact ?? "—"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {row.mobile ?? "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.relationship_manager?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`text-[10px] uppercase tracking-wide ${TONE_CLASS[status.tone]}`}
                >
                  {status.text}
                </Badge>
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
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
