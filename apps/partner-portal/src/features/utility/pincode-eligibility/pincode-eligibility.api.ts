// Legacy: channel-flexi/src/Components/UserUtility/PincodeEligibility/index.js
//   APIENDPOINTS.LOAN_TYPE_MASTER   GET  /alpha/v1/master/loan-type
//   APIENDPOINTS.ELIGIBLE_LENDERS   POST /alpha/v1/utility/lender-eligible/pincode
// (alpha-api app/routes/v1.go:605 → utilityController.LenderEligible)
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EligibilityRequest,
  EligibilityResult,
  LenderResult,
  LoanTypeOption,
} from "./pincode-eligibility.types";

const URL_LOAN_TYPE = "/alpha/v1/master/loan-type";
const URL_LENDER_ELIGIBLE_PINCODE = "/alpha/v1/utility/lender-eligible/pincode";

interface Envelope {
  data?: unknown;
  result?: unknown;
}

export function useLoanTypeOptions() {
  return useQuery({
    queryKey: ["pincode-eligibility.loan-types"],
    queryFn: async (): Promise<LoanTypeOption[]> => {
      const body = await api.get<unknown, Envelope>(URL_LOAN_TYPE);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LoanTypeOption[]) : [];
    },
  });
}

interface EligibilityBody {
  result?: {
    eligible_lenders?: LenderResult[];
    non_eligible_lenders?: LenderResult[];
  } | null;
  data?: {
    result?: {
      eligible_lenders?: LenderResult[];
      non_eligible_lenders?: LenderResult[];
    } | null;
  };
}

export function useEligibleLenders() {
  return useMutation({
    mutationFn: async (req: EligibilityRequest): Promise<EligibilityResult> => {
      const body = await api.post<unknown, EligibilityBody>(
        URL_LENDER_ELIGIBLE_PINCODE,
        req
      );
      // Legacy: response.data.result.{eligible_lenders,non_eligible_lenders}
      const result = body?.result ?? body?.data?.result;
      const eligible = result?.eligible_lenders;
      const nonEligible = result?.non_eligible_lenders;
      return {
        eligible_lenders: Array.isArray(eligible) ? eligible : [],
        non_eligible_lenders: Array.isArray(nonEligible) ? nonEligible : [],
      };
    },
  });
}
