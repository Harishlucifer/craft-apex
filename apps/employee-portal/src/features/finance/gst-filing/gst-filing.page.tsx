import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Badge,
  Button,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import {
  useGstFilingInvoiceList,
  useUpdateInvoiceGst,
} from "./gst-filing.api";
import type {
  FilingEntry,
  InvoiceRow,
  VendorGstFilingStatus,
} from "./gst-filing.types";

const PAGE_SIZE = 10;

// Legacy FilingOptions in VendorGSTFiling.js
const FILING_OPTIONS: { label: string; value: VendorGstFilingStatus | "" }[] = [
  { label: "Select…", value: "" },
  { label: "Filed", value: "FILED" },
  { label: "Not Filed", value: "NOT_FILED" },
];

// Legacy AmountExtractorWithComma — Indian locale grouping.
const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "0"
    : Number(v).toLocaleString("en-IN");

// Legacy formatDateMMDDYYYY.
const fmtDate = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
};

const selectClass =
  "h-9 w-40 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function GstFilingPage() {
  const [page, setPage] = useState(1);
  const [filingList, setFilingList] = useState<FilingEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: rows = [], isLoading, refetch } = useGstFilingInvoiceList();
  const updateGst = useUpdateInvoiceGst();

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const filingStatusFor = (id: number | string): VendorGstFilingStatus | "" => {
    const found = filingList.find((it) => it.id === String(id));
    return (found?.filing_status as VendorGstFilingStatus | undefined) ?? "";
  };

  const onChangeFiling = (
    id: number | string,
    value: VendorGstFilingStatus | ""
  ) => {
    setErrorMessage("");
    setFilingList((prev) => {
      const sid = String(id);
      if (!value) return prev.filter((it) => it.id !== sid);
      const exists = prev.some((it) => it.id === sid);
      if (exists) {
        return prev.map((it) =>
          it.id === sid ? { ...it, filing_status: value } : it
        );
      }
      return [...prev, { id: sid, filing_status: value }];
    });
  };

  const onSubmit = async () => {
    if (filingList.length === 0) {
      setErrorMessage("Please select any Invoice");
      return;
    }
    try {
      // Legacy payload — verbatim shape.
      const res = await updateGst.mutateAsync({
        data: filingList,
        gst_settlement_mode: "PAID_FULLY",
      });
      if (res?.status) {
        toast.success("Invoice GST status updated Successfully!");
        setFilingList([]);
        refetch();
      } else {
        toast.error(res?.message || "Something went wrong!");
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unexpected error occurred!"
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            GST Filing
          </h1>
          <p className="text-sm text-slate-500">
            Vendor invoices fully paid — select filing status and submit. {total}{" "}
            {total === 1 ? "invoice" : "invoices"}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={updateGst.isPending}
        >
          {updateGst.isPending ? "Submitting…" : "Submit"}
        </Button>
        {errorMessage && (
          <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
        )}
      </div>

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No invoices to file"
        emptyDescription="Fully-paid invoices will appear here for GST filing."
        columnCount={10}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead className="w-44">Select</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Vendor Name</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Tax Percentage</TableHead>
            <TableHead>Taxable Amount</TableHead>
            <TableHead className="text-right">Total Invoice Amount</TableHead>
            <TableHead>Vendor Filing Status</TableHead>
            <TableHead>GST Filed Date</TableHead>
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
        {pageRows.map((row: InvoiceRow, i) => {
          const id = row.id ?? `${row.invoiceNo}-${i}`;
          const selected = filingStatusFor(row.id);
          const isFiled = row.vendorGstFilingStatus === "FILED";
          return (
            <TableRow key={String(id)}>
              <TableCell>
                <select
                  className={selectClass}
                  value={selected}
                  onChange={(e) =>
                    onChangeFiling(
                      row.id,
                      e.target.value as VendorGstFilingStatus | ""
                    )
                  }
                >
                  {FILING_OPTIONS.map((opt) => (
                    <option key={opt.value || "blank"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.gstNo ?? "—"}
              </TableCell>
              <TableCell className="text-sm font-medium text-slate-900">
                {row.invoiceNo ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.coreChannelList?.name ?? "—"}
              </TableCell>
              <TableCell className="text-right text-sm text-slate-700">
                ₹{fmtAmount(row.netAmount)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-xs text-slate-600">
                  <span>SGST - {row.taxDetails?.sgst ?? 0} %</span>
                  <span>CGST - {row.taxDetails?.cgst ?? 0} %</span>
                  <span>IGST - {row.taxDetails?.igst ?? 0} %</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-xs text-slate-600">
                  <span>SGST - ₹{fmtAmount(row.taxDetails?.sgstAmount)}</span>
                  <span>CGST - ₹{fmtAmount(row.taxDetails?.cgstAmount)}</span>
                  <span>IGST - ₹{fmtAmount(row.taxDetails?.igstAmount)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-sm text-slate-700">
                ₹{fmtAmount(row.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    isFiled
                      ? "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                      : "bg-rose-100 text-[10px] uppercase tracking-wide text-rose-700"
                  }
                >
                  {isFiled ? "Filed" : "Unfiled"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {fmtDate(row.vendorGstFilingDate)}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
