import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PayoutPlanRow } from "./payout-plan-list.types";

// Legacy: GetCall(`/alpha/v1/finance/payout-plan/list/?payout_user_type=...&payout_category=...`)
function buildUrl(userType: string, category: string | undefined): string {
  const cat = category ? `&payout_category=${encodeURIComponent(category)}` : "";
  return `/alpha/v1/finance/payout-plan/list/?payout_user_type=${encodeURIComponent(userType)}${cat}`;
}

export function usePayoutPlanList(params: {
  userType: "CHANNEL" | "EMPLOYEE";
  category?: string;
}) {
  return useQuery({
    queryKey: ["payout-plan-list", params.userType, params.category ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PayoutPlanRow[]> => {
      const body = await api.get<unknown, any>(
        buildUrl(params.userType, params.category)
      );
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as PayoutPlanRow[]) : [];
    },
  });
}
