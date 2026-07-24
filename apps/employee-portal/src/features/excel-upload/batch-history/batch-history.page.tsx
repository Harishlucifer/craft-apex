import { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { Badge, Button, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { ExcelUploadNav } from "../excel-upload-nav";
import { useBatchList } from "./batch-history.api";
import type { BatchStatus } from "./batch-history.types";

const STATUS_BADGE: Record<BatchStatus, string> = {
  UPLOADED: "bg-blue-50 text-blue-700",
  VALIDATING: "bg-amber-50 text-amber-700",
  VALIDATED: "bg-blue-50 text-blue-700",
  COMMITTING: "bg-amber-50 text-amber-700",
  COMMITTED: "bg-emerald-50 text-emerald-700",
  COMMIT_FAILED: "bg-rose-50 text-rose-700",
  UNDONE: "bg-purple-50 text-purple-700",
  DISCARDED: "bg-slate-100 text-slate-500",
  EXPIRED: "bg-slate-100 text-slate-400",
};

function undoCountdown(expiresAt?: string): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m left`;
}

export default function BatchHistoryPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isFetching } = useBatchList(status, page, pageSize);
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filters: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Validated", value: "VALIDATED" },
    { label: "Committed", value: "COMMITTED" },
    { label: "Failed", value: "COMMIT_FAILED" },
    { label: "Undone", value: "UNDONE" },
    { label: "Expired", value: "EXPIRED" },
  ];

  return (
    <div className="space-y-5">
      <ExcelUploadNav />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Batch History</h1>
        <p className="text-xs font-medium text-slate-500">
          Excel Uploads &bull; undo available within the window for Committed batches
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              status === f.value
                ? "border-[#4C7DF0] bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<History className="h-8 w-8 text-slate-300" />}
        emptyTitle="No batches yet"
        pagination={{ page, totalPages, total, pageSize, onPageChange: setPage }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>File</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Template</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Rows (valid/err/skip)</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Uploaded</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Committed</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-end`}>Actions</TableHead>
          </TableRow>
        }
      >
        {rows.map((b) => {
          const countdown = undoCountdown(b.undo_window_expires_at);
          return (
            <TableRow key={b.id} className={TABLE_ROW_CLASS}>
              <TableCell className="font-medium text-slate-900">{b.file_name}</TableCell>
              <TableCell className="text-slate-500">
                {b.template_name ? `${b.template_name} v${b.template_version}` : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                <span className="text-emerald-600">{b.valid_rows}</span>/
                <span className="text-rose-600">{b.error_rows}</span>/
                <span className="text-amber-600">{b.skip_rows}</span>
              </TableCell>
              <TableCell>
                <Badge className={STATUS_BADGE[b.status]}>{b.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {new Date(b.uploaded_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {b.committed_at ? new Date(b.committed_at).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="text-end">
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/settings/excel-upload/batches/${b.id}`}>
                    {countdown ? `View · Undo (${countdown})` : "View"}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
