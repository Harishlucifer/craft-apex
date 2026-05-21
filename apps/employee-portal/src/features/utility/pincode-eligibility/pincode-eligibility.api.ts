import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EligibilityRequest,
  EligibilityResult,
  LoanTypeOption,
} from "./pincode-eligibility.types";

const LOAN_TYPE_URL = "/alpha/v1/master/loan-type";
const ELIGIBLE_LENDERS_URL = "/alpha/v1/utility/lender-eligible/pincode";

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["loan-type-master"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, any>(LOAN_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

export function useEligibleLenders() {
  return useMutation({
    mutationFn: async (req: EligibilityRequest): Promise<EligibilityResult> => {
      const body = await api.post<unknown, any>(ELIGIBLE_LENDERS_URL, req);
      const result = body?.result ?? body?.data?.result ?? body?.data ?? body;
      return {
        eligible_lenders: result?.eligible_lenders ?? [],
        non_eligible_lenders: result?.non_eligible_lenders ?? [],
      };
    },
  });
}
