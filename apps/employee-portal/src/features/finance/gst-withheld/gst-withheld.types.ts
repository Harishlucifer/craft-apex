// Legacy /Components/PayableReceivableManagement/InVoice/WithHeldInvoice.js
// Backing endpoint: GET /alpha/v1/finance/invoice?gst_settlement_mode=PAYMENT_WITHOUT_GST
// Update endpoint: POST /alpha/v1/finance/invoice/invoice-status-update
//
// Field names taken verbatim from the legacy `columns` accessors.

export interface GstWithheldTaxDetails {
  sgst?: number | string;
  cgst?: number | string;
  igst?: number | string;
  sgstAmount?: number | string;
  cgstAmount?: number | string;
  igstAmount?: number | string;
}

export interface GstWithheldCoreChannel {
  name?: string;
}

export interface GstWithheldRow {
  id: string;
  gstNo?: string;
  invoiceNo?: string;
  coreChannelList?: GstWithheldCoreChannel;
  netAmount?: number | string;
  totalAmount?: number | string;
  gstWithHeldAmount?: number | string;
  taxDetails?: GstWithheldTaxDetails;
  /** 2 => "Approved For Release", else "WithHeld" (legacy). */
  is_gst_released?: number | string;
  gst_release_approved_date?: string;
}

/** Legacy POST payload to INVOICE_GST_UPDATE. */
export interface GstWithheldReleasePayload {
  data: { id: string }[];
  gst_settlement_mode: "PAYMENT_WITHOUT_GST";
}

/** Legacy axios body shape (status/message/data). */
export interface GstWithheldUpdateEnvelope {
  status?: boolean;
  message?: string;
  data?: unknown;
}
