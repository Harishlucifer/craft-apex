import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdjustmentRow } from "./adjustment-card.types";

// Legacy file:
//   /Users/fingrid/Vibing/craft-frontend/src/Components/PayableReceivableManagement/InVoice/Adjustments.js
//
// Endpoints (verbatim from src/Components/helper/ApiEndPoint.js):
//   GET_FIELD_MASTER_LIST    = /alpha/v1/master/field-master
//   GET_ADJUSTMENT_LIST      = /alpha/v1/finance/invoice/adjustment/list
//   CREATE_INVOICE_ADJUSTMENT = /alpha/v1/finance/invoice/adjustment
//
// IMPORTANT: GET_ADJUSTMENT_LIST is invoice-scoped — the legacy component is an
// embedded sub-flow that always receives an `invoiceId` prop from its parent
// (Invoice detail page). The standalone route /finance/adjustment-card has no
// invoice context, so the hook below requires the caller to pass invoiceId.

export const FIELD_MASTER_URL = "/alpha/v1/master/field-master";
export const ADJUSTMENT_LIST_URL = "/alpha/v1/finance/invoice/adjustment/list";
export const CREATE_ADJUSTMENT_URL = "/alpha/v1/finance/invoice/adjustment";

// Verbatim from legacy ModuleNames.invoiceAdjustment (constants/constant.js:829)
export const INVOICE_ADJUSTMENT_MODULE = "INVOICE_ADJUSTMENT";

export function useAdjustmentList(invoiceId: string | number | undefined) {
  return useQuery({
    enabled: invoiceId !== undefined && invoiceId !== "",
    queryKey: ["invoice-adjustment-list", invoiceId],
    queryFn: async (): Promise<AdjustmentRow[]> => {
      // Legacy: GetCall(`${GET_ADJUSTMENT_LIST}?invoice_id=${invoiceId}`)
      // Legacy reads res.status then res.data.data (axios-wrapped). The shared
      // api.get from @/lib/api unwraps to the body, so legacy `res.data.data`
      // becomes `body.data` here.
      const body = await api.get<unknown, any>(
        `${ADJUSTMENT_LIST_URL}?invoice_id=${invoiceId}`,
      );
      const rows = Array.isArray(body?.data) ? body.data : [];
      return rows as AdjustmentRow[];
    },
  });
}

// DEFERRED — Create-adjustment sub-flow.
// Legacy submits one POST per item in the form-builder array:
//   PostCall(CREATE_INVOICE_ADJUSTMENT, {
//     invoice_id, adjustment_type, adjustment_reason,
//     adjustment_amount, tax_applicable: 1,
//   })
// Needs the craft-formbuilder DynamicForm (field-master fetched with
// ?code=INVOICE_ADJUSTMENT) which is not yet wired in craft-apex.
