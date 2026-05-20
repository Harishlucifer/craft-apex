import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useEmployerList } from "./employer-list.api";

const PAGE_SIZE = 10;

function statusBadge(s?: string) {
  if (s === "Active") return <Badge variant="success">Active</Badge>;
  if (s === "Inactive") return <Badge variant="warning">Inactive</Badge>;
  return <Badge variant="secondary">{s ?? "—"}</Badge>;
}

export default function EmployerListPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  // Tiny debounce so each keystroke doesn't fire the search GET.
  const [committedKeyword, setCommittedKeyword] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setCommittedKeyword(keyword), 300);
    return () => clearTimeout(id);
  }, [keyword]);
  useEffect(() => setPage(1), [committedKeyword]);

  const { data, isFetching } = useEmployerList({
    page,
    keyword: committedKeyword || undefined,
  });
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by CIN, name…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={5}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No employers found"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>CIN</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Employer Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>ROC</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Company Status</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow
            key={`${String(r.employer_id ?? r.cin ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="font-mono text-xs">{r.cin ?? "—"}</TableCell>
            <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
            <TableCell>{r.roc ?? "—"}</TableCell>
            <TableCell>{statusBadge(r.company_status)}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
