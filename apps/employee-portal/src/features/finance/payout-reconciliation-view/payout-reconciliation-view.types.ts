// Legacy: craft-frontend/src/pages/PayableReceivableMgmt/Lender/PayoutReconciliationView.js
// (mounted at /finance/payout-reconciliation-view/:id via legacy allRoutes.js)
//
// Endpoint (verbatim usage from legacy):
//   GetCall(APIENDPOINTS.PAYOUT_REVIEW_DETAILS.replace(":payout_dump_id", id))
//
// NOTE: `APIENDPOINTS.PAYOUT_REVIEW_DETAILS` is referenced in the legacy file
// but is NOT defined in craft-frontend/src/Components/helper/ApiEndPoint.js.
// The only verbatim facts available are:
//   - constant name:  PAYOUT_REVIEW_DETAILS
//   - path param key: :payout_dump_id
// The api module documents this gap with a LEGACY-TODO; do not invent a URL.
//
// Response shape consumed by legacy (verbatim):
//   response.status === true
//   response.data.result.payout_review_list : Array<{ label: string; List: PayoutReviewRow[] }>
//   response.data.result.payout_dump        : object (currently unused in this view)
//
// Row fields are mirrored from the legacy column accessors verbatim.

export interface PayoutReviewRow {
  applicationId?: string | number;
  internalApplicationId?: string | number;
  product?: string;
  applicantName?: string;
  disbursedAmount?: string | number;
  internalDisbursedDate?: string;
  payoutRate?: string | number;
  payoutAmount?: string | number;
  subvention?: string | number;
}

export interface PayoutReviewBucket {
  label: string;
  List: PayoutReviewRow[];
}

export interface PayoutReviewResult {
  payout_review_list: PayoutReviewBucket[];
  payout_dump?: unknown;
}

// Category constants — verbatim from legacy PayoutReconciliationView.js.
export const CATEGORY_TOTAL = "TOTAL";
export const CATEGORY_MATCHED = "MATCHED";
export const CATEGORY_AMOUNT_MIS_MATCH = "AMOUNT_MIS_MATCH";
export const CATEGORY_NO_IN_LOS = "NO_IN_LOS";
export const CATEGORY_NO_ATTRIBUTE = "NO_ATTRIBUTE";

export type ReviewCategory =
  | typeof CATEGORY_TOTAL
  | typeof CATEGORY_MATCHED
  | typeof CATEGORY_AMOUNT_MIS_MATCH
  | typeof CATEGORY_NO_IN_LOS
  | typeof CATEGORY_NO_ATTRIBUTE;
