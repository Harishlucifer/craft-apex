import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PayoutReviewResult } from "./payout-reconciliation-view.types";

// LEGACY-TODO: `APIENDPOINTS.PAYOUT_REVIEW_DETAILS` is referenced in
// craft-frontend/src/pages/PayableReceivableMgmt/Lender/PayoutReconciliationView.js
// but is NOT defined in craft-frontend/src/Components/helper/ApiEndPoint.js.
// The only verbatim facts available are:
//   - constant name:  PAYOUT_REVIEW_DETAILS
//   - path param key: :payout_dump_id
// Replace the URL below with the verbatim value once the backend contract is
// confirmed. Until then the request will 404 — the page handles that
// gracefully by rendering empty buckets.
const PAYOUT_REVIEW_DETAILS_URL = "/alpha/v1/finance/payout-dump/:payout_dump_id";

export function usePayoutReviewDetails(payoutDumpId: string | undefined) {
  return useQuery({
    queryKey: ["payout-review-details", String(payoutDumpId ?? "")],
    enabled: Boolean(payoutDumpId),
    queryFn: async (): Promise<PayoutReviewResult | null> => {
      const url = PAYOUT_REVIEW_DETAILS_URL.replace(
        ":payout_dump_id",
        encodeURIComponent(String(payoutDumpId))
      );
      // Legacy GetCall(url) returns the response body directly. The axios
      // instance here (createApiClient) returns response.data via its
      // interceptor, so `api.get(url)` gives the same shape the legacy code
      // reads: response.status / response.data.result.
      const body = await api.get<unknown, any>(url);
      if (!body?.status) return null;
      const result = body?.data?.result;
      if (!result) return null;
      return {
        payout_review_list: Array.isArray(result.payout_review_list)
          ? result.payout_review_list
          : [],
        payout_dump: result.payout_dump,
      };
    },
  });
}
