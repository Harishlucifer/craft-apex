// Verbatim from legacy:
//   /Users/fingrid/Vibing/craft-frontend/src/Components/PayableReceivableManagement/InVoice/Adjustments.js
//
// Listing shape (GET /alpha/v1/finance/invoice/adjustment/list?invoice_id=…):
//   res.status === true
//   res.data.data: AdjustmentRow[]
//
// Each row uses these field names (read from the structuredData mapping
// in fetchExistingAdjustmentData):
//   - adjustment_type
//   - adjustment_amount
//   - adjustment_reason
//
// Create payload (POST /alpha/v1/finance/invoice/adjustment) — verbatim:
//   {
//     invoice_id: <number>,
//     adjustment_type: string,
//     adjustment_reason: string,
//     adjustment_amount: number,
//     tax_applicable: 1,
//   }

export interface AdjustmentRow {
  adjustment_type?: string;
  adjustment_amount?: number | string;
  adjustment_reason?: string;
}

export interface CreateAdjustmentPayload {
  invoice_id: number | string;
  adjustment_type: string;
  adjustment_reason: string;
  adjustment_amount: number;
  tax_applicable: 1;
}
