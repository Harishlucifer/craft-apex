import { PermissionGate } from "@craft-apex/layout";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button, Input, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useLenderPincodeUploadList } from "./lender-pincode-list.api";
import type { LenderPincodeUploadRow } from "./lender-pincode-list.types";

const fileName = (url?: string) => {
  if (!url) return "—";
  try {
    return url.split("/").filter(Boolean).pop() ?? url;
  } catch {
    return url;
  }
};

export default function LenderPincodeListPage() {
  const { data = [], isFetching } = useLenderPincodeUploadList();
  const list = useClientList<LenderPincodeUploadRow>(data, (r, q) =>
    [r.lender_name, r.loan_type, r.configuration_type].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
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
            placeholder="Search by lender, loan type, configuration…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <PermissionGate action="add">
          <Button asChild>
            <Link to="/settings/lender/pin-code/create">
              <Plus className="h-4 w-4" /> Add Pincode Upload
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && data.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No pincode uploads"
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
            <TableHead className={TABLE_HEAD_CLASS}>Lender</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Configuration</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>File</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Pincodes</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={`${String(r.pincode_upload_id ?? r.file_link ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell className="font-medium">{r.lender_name ?? "—"}</TableCell>
            <TableCell>{r.loan_type ?? "—"}</TableCell>
            <TableCell>{r.configuration_type ?? "—"}</TableCell>
            <TableCell>
              {r.file_link ? (
                <a
                  href={r.file_link}
                  className="text-xs text-[#4C7DF0] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {fileName(r.file_link)}
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-sm">
              {r.eligible_pincode_count ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
