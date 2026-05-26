import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Button,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import {
  useLenderMaster,
  useLoanTypeMaster,
} from "./receivable-invoice.api";
import type {
  ReceivableInvoiceFilters,
  ReceivableInvoiceRow,
  SelectOption,
} from "./receivable-invoice.types";

const PAGE_SIZE = 10;

// Legacy column set — verbatim Header text from
// craft-frontend/src/pages/PayableReceivableMgmt/Invoice/LenderInvoice.js
const COLUMN_COUNT = 11;

export default function ReceivableInvoicePage() {
  const [filters, setFilters] = useState<ReceivableInvoiceFilters>({
    lender_id: "",
    loan_type_id: "",
    month: "",
  });
  const [page, setPage] = useState(1);

  const { data: lenders = [], isLoading: lendersLoading } = useLenderMaster();
  const { data: loanTypes = [], isLoading: loanTypesLoading } = useLoanTypeMaster();

  // Legacy reshapes the master lists into {value,label} options.
  const lenderOptions: SelectOption[] = useMemo(
    () =>
      lenders.map((l) => ({
        label: l.name,
        value: String(l.lender_id),
      })),
    [lenders],
  );
  const loanTypeOptions: SelectOption[] = useMemo(
    () =>
      loanTypes.map((l) => ({
        label: l.name,
        value: String(l.id),
      })),
    [loanTypes],
  );

  // DEFERRED: list endpoint is not verifiable from the legacy file
  // (table is rendered with `data={[]}`). Until the endpoint is confirmed,
  // the table stays empty and pagination is hard-coded to 1 page.
  const rows: ReceivableInvoiceRow[] = [];
  const total = 0;
  const totalPages = 1;
  const isLoading = false;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lender Invoice
          </h1>
          <p className="text-sm text-slate-500">Invoice</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {/* Verified filter bar — mirrors legacy invoiceFormik fields:
          lender_id, loan_type_id, month. */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lender_id">Lender Name *</Label>
            <select
              id="lender_id"
              value={filters.lender_id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, lender_id: e.target.value }))
              }
              disabled={lendersLoading}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
            >
              <option value="">Select…</option>
              {lenderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loan_type_id">Loan Type *</Label>
            <select
              id="loan_type_id"
              value={filters.loan_type_id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, loan_type_id: e.target.value }))
              }
              disabled={loanTypesLoading}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
            >
              <option value="">Select…</option>
              {loanTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="month">Month *</Label>
            <Input
              id="month"
              type="date"
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {/* DEFERRED: legacy "Submit" button has no onClick — left as a
              non-functional placeholder to mirror legacy behaviour. */}
          <Button variant="default" disabled>
            Submit
          </Button>
          {/* DEFERRED: legacy "Generate Invoice" calls GetCall(APIENDPOINTS)
              (the whole endpoint object) — no verifiable target endpoint. */}
          <Button variant="secondary" disabled>
            Generate Invoice
          </Button>
        </div>
      </div>

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No lender invoices"
        emptyDescription="Generate an invoice to populate this list."
        columnCount={COLUMN_COUNT}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Channel ID</TableHead>
            <TableHead>Channel Name</TableHead>
            <TableHead>Loan Type</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Tax Amount</TableHead>
            <TableHead>State</TableHead>
            <TableHead>status</TableHead>
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
          <TableRow key={String(row.channel_id ?? `r-${i}`)}>
            <TableCell className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.channel_id ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.channel_name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.loan_type ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.month ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.invoice_no ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.invoice_date ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.net_amount ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.tax_amount ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.state ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.status ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      {/* DEFERRED: legacy file has no modals/drawers/InvoiceFilter components;
          only the verified lender / loan-type / month filter bar above. */}
    </div>
  );
}
