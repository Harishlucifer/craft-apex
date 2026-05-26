import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button, TableHead, TableRow } from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";

// Legacy /finance/invoice-details/ (no :id) mounts InvoiceProcessingCreate ->
// InvoiceWorkFlow. With no id the component runs the workflow builder in
// "create" mode (POST /alpha/v1/workflow/build with workflow_type INVOICE_FLOW)
// and renders an MUI Stepper of dynamically-loaded step components. There is
// NO list endpoint in the legacy code for this route.
//
// DEFERRED: full workflow builder, step components, Ask modal, Adjustments,
// PDF generation, and "Generate Invoice" submit. Per the no-guessing rule we
// do not invent a list endpoint. This list page renders an empty shell with
// a clear deferral note so the route resolves and the detail (:id) screen
// remains reachable via direct link.
export default function InvoiceDetailsListPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Details
          </h1>
          <p className="text-sm text-slate-500">
            Invoice workflow entry — list view is pending workflow port.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <DataTableShell
        loading={false}
        isEmpty
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="Workflow list deferred"
        emptyDescription="The legacy /finance/invoice-details/ route mounts the invoice workflow builder, not a list. Open an invoice by its id (/finance/invoice-details/:id) to see the detail view."
        columnCount={1}
        header={
          <TableRow>
            <TableHead>Invoice</TableHead>
          </TableRow>
        }
      >
        {null}
      </DataTableShell>
    </div>
  );
}
