import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import {
  useEligiblePincodeList,
  type EligiblePincodeFilter,
} from "./lender-eligible-pincode-list.api";

const PAGE_SIZE = 10;

export default function LenderEligiblePincodeListPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [filter] = useState<EligiblePincodeFilter>({});

  const { data, isLoading } = useEligiblePincodeList(page, {
    ...filter,
    keyword: keyword.trim() || undefined,
  });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lender Eligible Pincodes
          </h1>
          <p className="text-sm text-slate-500">
            {total} {total === 1 ? "pincode" : "pincodes"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Input
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setPage(1);
        }}
        placeholder="Search pincodes…"
        className="max-w-xs"
      />

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<MapPin className="h-8 w-8 text-slate-300" />}
        emptyTitle="No eligible pincodes found"
        emptyDescription="Pincode-lender mappings will show up here once uploaded."
        columnCount={4}
        skeletonRows={8}
        header={
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Pincode</TableHead>
            <TableHead>Lender</TableHead>
            <TableHead>Loan Type</TableHead>
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
          <TableRow key={String(row.id ?? `${row.pincode}-${i}`)}>
            <TableCell className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="font-mono text-sm text-slate-900">
              {row.pincode ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.lender?.name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.loan_type?.loan ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
