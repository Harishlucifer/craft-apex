import { useState } from "react";
import { Search } from "lucide-react";
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
} from "@craft-apex/shared";
import { useAskList } from "./ask-list.api";
import { ASK_STATUS_LABEL } from "./ask-list.types";

/**
 * Legacy channel-flexi/src/Components/Common/AskList.js.
 *
 * Deferred (legacy features not ported): the ask-count dashboard cards
 * (`response.dashboard`, clickable status drill-down), AskFilter side panel,
 * AskViewModal, accept/reopen actions (POST ask status), the document-upload
 * + IaaS resolve-ask flow, and the XLSX export.
 */

const PAGE_SIZE = 10;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "—";

const statusVariant = (status?: number) => {
  switch (status) {
    case 2:
      return "bg-amber-100 text-amber-700";
    case 3:
      return "bg-sky-100 text-sky-700";
    case 4:
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AskListPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState("");

  const { data, isFetching } = useAskList({
    page,
    ...(keyword ? { keyword } : {}),
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setKeyword(draft);
          setPage(1);
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 w-64 pl-8"
            placeholder="Search asks…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="h-9">
          Search
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9"
          onClick={() => {
            setDraft("");
            setKeyword("");
            setPage(1);
          }}
        >
          Reset
        </Button>
      </form>

      <DataTableShell
        columnCount={9}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No asks found"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Application Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Sourced By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Type of Ask</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Remarks</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Raised By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Raised Date</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow
            key={`${r.ApplicationCode ?? r.applicationId ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs font-medium">
              {r.ApplicationCode ?? "—"}
            </TableCell>
            <TableCell>{r.business_name ?? "—"}</TableCell>
            <TableCell>{r.loan_type ?? "—"}</TableCell>
            <TableCell>
              <div>{r.sourced_by?.user_name ?? "—"}</div>
              {r.sourced_by?.user_role ? (
                <div className="text-[11px] text-slate-400">
                  {r.sourced_by.channel_name
                    ? `${r.sourced_by.channel_name} · `
                    : ""}
                  {r.sourced_by.user_role}
                </div>
              ) : null}
            </TableCell>
            <TableCell>{r.askType ?? "—"}</TableCell>
            <TableCell
              className="max-w-[260px] truncate text-slate-500"
              title={r.title ?? ""}
            >
              {r.title ?? "—"}
            </TableCell>
            <TableCell>{r.raisedByUser?.username ?? "—"}</TableCell>
            <TableCell>
              {r.status != null ? (
                <Badge variant="secondary" className={statusVariant(r.status)}>
                  {ASK_STATUS_LABEL[r.status] ?? String(r.status)}
                </Badge>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDate(r.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
