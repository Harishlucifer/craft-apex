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
  useGstWithheldList,
  useReleaseGstWithheld,
} from "./gst-withheld.api";
import type { GstWithheldRow } from "./gst-withheld.types";

// Legacy AmountExtractorWithComma helper.
function amountExtractorWithComma(amount: unknown): string {
  const n = parseFloat(String(amount ?? "").replace(/,/g, "").trim());
  if (isNaN(n)) return "";
  return n >= 1000 ? Intl.NumberFormat("en-IN").format(n) : String(n);
}

// Legacy formatDateMMDDYYYY helper.
function formatDateMMDDYYYY(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function GstWithheldPage() {
  const { data, isLoading, refetch } = useGstWithheldList();
  const rows: GstWithheldRow[] = data ?? [];

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  const release = useReleaseGstWithheld();

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    if (checked) setErrorMessage("");
  };

  const onRelease = () => {
    if (selected.size === 0) {
      setErrorMessage("Please select any Invoice");
      return;
    }
    release.mutate(Array.from(selected), {
      onSuccess: (resp) => {
        if (resp?.status) {
          toast.success("Invoice GST status updated Successfully!");
          setSelected(new Set());
          refetch();
        } else {
          toast.error(resp?.message || "Something went wrong!");
        }
      },
      onError: (e) => {
        toast.error(
          e instanceof Error ? e.message : "Unexpected error occurred!"
        );
      },
    });
  };

  const total = rows.length;
  const totalPages = 1;

  // Mirror of the legacy `columns` set — kept here for readability.
  const columnHeaders = useMemo(
    () => [
      "Select",
      "GSTIN",
      "Invoice No",
      "Vendor Name",
      "Taxable Amount",
      "Tax Percentage",
      "Tax Amount",
      "Total Invoice Amount",
      "GST Withheld Amount",
      "GST Release Status",
      "GST Release Approval Date",
    ],
    []
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            GST Withheld
          </h1>
          <p className="text-sm text-slate-500">
            Invoices billed without GST. {total}{" "}
            {total === 1 ? "invoice" : "invoices"}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          size="sm"
          onClick={onRelease}
          disabled={release.isPending}
        >
          {release.isPending ? "Releasing…" : "Release GST"}
        </Button>
        {errorMessage && (
          <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
        )}
      </div>

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No withheld invoices"
        emptyDescription="Invoices billed without GST will appear here."
        columnCount={columnHeaders.length}
        skeletonRows={6}
        header={
          <TableRow>
            {columnHeaders.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        }
        pagination={{
          page: 1,
          totalPages,
          total,
          pageSize: total || 1,
          onPageChange: () => undefined,
        }}
      >
        {rows.map((row) => {
          const isSelected = selected.has(row.id);
          const isApproved = String(row.is_gst_released) === "2";
          return (
            <TableRow key={row.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => toggle(row.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.gstNo ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.invoiceNo ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.coreChannelList?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                ₹{amountExtractorWithComma(row.netAmount)}
              </TableCell>
              <TableCell className="text-xs text-slate-700">
                <div>SGST - {row.taxDetails?.sgst ? row.taxDetails.sgst : 0} %</div>
                <div>CGST - {row.taxDetails?.cgst ? row.taxDetails.cgst : 0} %</div>
                <div>IGST - {row.taxDetails?.igst ? row.taxDetails.igst : 0} %</div>
              </TableCell>
              <TableCell className="text-xs text-slate-700">
                <div>SGST - ₹{amountExtractorWithComma(row.taxDetails?.sgstAmount)}</div>
                <div>CGST - ₹{amountExtractorWithComma(row.taxDetails?.cgstAmount)}</div>
                <div>IGST - ₹{amountExtractorWithComma(row.taxDetails?.igstAmount)}</div>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                ₹{amountExtractorWithComma(row.totalAmount)}
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                ₹{amountExtractorWithComma(row.gstWithHeldAmount)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    isApproved
                      ? "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                      : "bg-amber-100 text-[10px] uppercase tracking-wide text-amber-700"
                  }
                >
                  {isApproved ? "Approved For Release" : "WithHeld"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-700">
                {row.gst_release_approved_date
                  ? formatDateMMDDYYYY(row.gst_release_approved_date)
                  : ""}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
