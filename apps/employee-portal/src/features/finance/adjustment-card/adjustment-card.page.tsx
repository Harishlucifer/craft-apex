import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useAdjustmentList } from "./adjustment-card.api";

// Legacy: src/Components/PayableReceivableManagement/InVoice/Adjustments.js
//
// The legacy "Adjustments" component is an embedded sub-flow rendered inside
// the Invoice detail page. It receives `invoiceId` as a prop and renders a
// craft-formbuilder DynamicForm whose schema is fetched from
// GET /alpha/v1/master/field-master?code=INVOICE_ADJUSTMENT, and POSTs each
// adjustment to /alpha/v1/finance/invoice/adjustment.
//
// The standalone route /finance/adjustment-card has no invoice context in the
// legacy router either — it mounts <AdjustmentsCard /> with an undefined
// invoiceId. To avoid inventing endpoints, this page lets the user type/pick
// an invoice id (or pass ?invoice_id=… in the URL) and lists the adjustments
// using the verbatim GET_ADJUSTMENT_LIST endpoint.
//
// DEFERRED:
//   - DynamicForm-based create/edit modal (needs craft-formbuilder host).
//   - Field-master schema fetch for INVOICE_ADJUSTMENT module.
//   - Multi-row POST submission to CREATE_INVOICE_ADJUSTMENT.

export default function AdjustmentCardPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("invoice_id") ?? "";
  const [draft, setDraft] = useState(initial);
  const [invoiceId, setInvoiceId] = useState(initial);

  const { data, isLoading } = useAdjustmentList(invoiceId || undefined);
  const rows = data ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    setInvoiceId(next);
    if (next) setParams({ invoice_id: next });
    else setParams({});
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Adjustments
          </h1>
          <p className="text-sm text-slate-500">
            Adjustments raised against a specific invoice. Enter an invoice id
            to view its adjustments.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="flex max-w-md items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Invoice id…"
        />
        <Button type="submit" size="sm">
          Load
        </Button>
        {invoiceId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft("");
              setInvoiceId("");
              setParams({});
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* DEFERRED: "Add adjustment" button → DynamicForm modal (craft-formbuilder). */}

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle={invoiceId ? "No adjustments" : "Enter an invoice id"}
        emptyDescription={
          invoiceId
            ? "This invoice has no adjustments recorded yet."
            : "Adjustments are scoped per invoice. Provide an invoice id above to load its adjustments."
        }
        columnCount={4}
        skeletonRows={5}
        header={
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Adjustment Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        }
      >
        {rows.map((row, i) => (
          <TableRow key={`${row.adjustment_type ?? "row"}-${i}`}>
            <TableCell className="text-xs text-slate-500">{i + 1}</TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.adjustment_type ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.adjustment_amount ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.adjustment_reason ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
