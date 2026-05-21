import { Link } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useVerificationList } from "./verification-queue.api";
import type { VerificationRow } from "./verification-queue.types";

const fmt = (n?: number | string) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-IN").format(Number(n));

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleString("en-IN") : "—";

export default function VerificationQueuePage() {
  const { data = [], isFetching } = useVerificationList();
  const list = useClientList<VerificationRow>(data, (r, q) =>
    [r.application_code, r.verification_type, r.name, r.verification_status].some(
      (v) => String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search by lead, type, applicant, status…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/operations/verification/summary">Summary</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/operations/verification/transfer">Transfer</Link>
          </Button>
        </div>
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No verifications in the queue"
        pagination={{
          page: list.page,
          totalPages: list.totalPages,
          total: list.total,
          pageSize: list.pageSize,
          onPageChange: list.setPage,
          onPageSizeChange: list.setPageSize,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Verification Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>Loan Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Updated</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>Action</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.verification_id ?? r.application_code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-medium">{r.verification_type ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">{r.application_code ?? "—"}</TableCell>
            <TableCell>{r.name ?? "—"}</TableCell>
            <TableCell className="text-right font-mono text-xs">{fmt(r.loan_amount)}</TableCell>
            <TableCell>
              <Badge variant="secondary">{r.verification_status ?? "—"}</Badge>
            </TableCell>
            <TableCell className="text-xs text-slate-500">{fmtDate(r.updatedAt)}</TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="ghost" className="gap-1.5">
                <Link to={`/operations/verification/${String(r.verification_id ?? "")}`}>
                  <Eye className="h-3.5 w-3.5" /> View
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
