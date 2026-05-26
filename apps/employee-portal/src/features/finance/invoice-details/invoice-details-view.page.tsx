import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, UserCog } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader } from "@craft-apex/ui";
import { useInvoiceDetail, usePartnerInfo } from "./invoice-details.api";

// Legacy craft-frontend/src/Components/PayableReceivableManagement/InVoice/invoiceWorkFlow.js
//
// Header (verbatim):
//   "System Generated Invoice No :"  -> invoiceData?.id
//   "Invoice No :"                   -> invoiceData?.invoice_no
//
// partnerDetails (verbatim labels, in order):
//   { label: "Channel Name",   value: channelInfo?.application?.name }
//   { label: "Channel ID",     value: String(channelInfo?.application?.channel_id) }
//   { label: "Category",       value: channelInfo?.application?.category }
//   { label: "Channel Mobile", value: String(channelInfo?.application?.mobile) }
//   { label: "Type",           value: channelInfo?.application?.partner_type }
//
// invoiceDetails (verbatim labels, in order):
//   { label: "Invoice No",     value: invoiceData?.invoice_no }
//   { label: "Invoice Date",   value: invoiceData?.created_at }
//   { label: "Net Amount",     value: invoiceData?.net_amount }
//   { label: "Tax Amount",     value: invoiceData?.tax_amount }
//   { label: "Total Amount",   value: invoiceData?.total_amount }

function Row({ label, value }: { label: string; value?: string | number }) {
  const text =
    value === undefined || value === null || value === ""
      ? "—"
      : String(value);
  return (
    <p className="text-sm text-slate-700">
      <strong className="text-slate-900">{label}:</strong> {text}
    </p>
  );
}

export default function InvoiceDetailsViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoiceData, isLoading: invoiceLoading } =
    useInvoiceDetail(id);
  const { data: channelInfo, isLoading: partnerLoading } = usePartnerInfo(
    invoiceData?.channel_id,
  );

  const app = channelInfo?.application;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Details
          </h1>
          <p className="text-sm text-slate-500">Invoice</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/finance/invoice-details/">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span>System Generated Invoice No :</span>
            <Badge className="bg-emerald-100 text-emerald-700">
              {invoiceLoading ? "…" : (invoiceData?.id ?? "—")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span>Invoice No :</span>
            <Badge className="bg-emerald-100 text-emerald-700">
              {invoiceLoading ? "…" : (invoiceData?.invoice_no ?? "—")}
            </Badge>
          </div>
          {/* DEFERRED: Action dropdown ("Ask") and Ask modal. */}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b bg-slate-50">
            <UserCog className="h-5 w-5 text-sky-600" />
            <span className="text-sm font-semibold text-slate-900">
              Partner Details
            </span>
          </CardHeader>
          <CardContent className="space-y-1 py-4">
            {partnerLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <>
                <Row label="Channel Name" value={app?.name} />
                <Row
                  label="Channel ID"
                  value={
                    app?.channel_id !== undefined
                      ? String(app.channel_id)
                      : undefined
                  }
                />
                <Row label="Category" value={app?.category} />
                <Row
                  label="Channel Mobile"
                  value={
                    app?.mobile !== undefined ? String(app.mobile) : undefined
                  }
                />
                <Row label="Type" value={app?.partner_type} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b bg-slate-50">
            <FileText className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">
              Invoice Details
            </span>
          </CardHeader>
          <CardContent className="space-y-1 py-4">
            {invoiceLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <>
                <Row label="Invoice No" value={invoiceData?.invoice_no} />
                <Row label="Invoice Date" value={invoiceData?.created_at} />
                <Row label="Net Amount" value={invoiceData?.net_amount} />
                <Row label="Tax Amount" value={invoiceData?.tax_amount} />
                <Row label="Total Amount" value={invoiceData?.total_amount} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DEFERRED: workflow stage tabs + MUI Stepper of step components
          (StepComponentLoader, Adjustments, InvoicePdf, CaseDetails) and the
          Ask modal. Wire these up once their endpoints/components are ported. */}
    </div>
  );
}
