import { Search } from "lucide-react";
import { Badge, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useVerificationTypeList } from "./verification-type-list.api";
import type { VerificationTypeRow } from "./verification-type-list.types";

export default function VerificationTypeListPage() {
  const { data = [], isFetching } = useVerificationTypeList();
  const list = useClientList<VerificationTypeRow>(data, (r, q) =>
    [r.verification_type, r.employment_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search by verification or employment type…"
          className="h-10 rounded-full bg-white pl-9"
        />
      </div>

      <DataTableShell
        columnCount={4}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No verification types found"
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
            <TableHead className={TABLE_HEAD_CLASS}>S.No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Verification Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Employment Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.category_id ?? r.verification_type ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">
              {r.verification_type ?? "—"}
            </TableCell>
            <TableCell>{r.employment_type ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={r.status === 1 ? "success" : "destructive"}>
                {r.status === 1 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
