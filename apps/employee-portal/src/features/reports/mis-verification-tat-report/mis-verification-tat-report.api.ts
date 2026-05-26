import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiDataResponse,
  ApiResultResponse,
  LoanTypeRow,
  TerritoryRow,
  VerificationCategoryRow,
  VerificationRow,
} from "./mis-verification-tat-report.types";

// Legacy ApiEndPoint.js:
//   VERIFICATION_CATEGORY_LIST = /alpha/v1/verification/category/list
//   LOAN_TYPE_MASTER           = /alpha/v1/master/loan-type
//   LEAST_TERRITORY            = /alpha/v1/user/least/territory  (alias of USER_LEAST_TERRITORY)
//   VERIFICATION_LIST          = /alpha/v1/verification/list
const VERIFICATION_CATEGORY_LIST_URL = "/alpha/v1/verification/category/list";
const LOAN_TYPE_MASTER_URL = "/alpha/v1/master/loan-type";
const LEAST_TERRITORY_URL = "/alpha/v1/user/least/territory";
const VERIFICATION_LIST_URL = "/alpha/v1/verification/list";

export function useVerificationCategoryList() {
  return useQuery({
    queryKey: ["verification-category-list"],
    queryFn: async (): Promise<VerificationCategoryRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<VerificationCategoryRow>>(
        VERIFICATION_CATEGORY_LIST_URL
      );
      return body?.data ?? [];
    },
  });
}

export function useLoanTypeMaster() {
  return useQuery({
    queryKey: ["loan-type-master"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<LoanTypeRow>>(
        LOAN_TYPE_MASTER_URL
      );
      return body?.data ?? [];
    },
  });
}

export function useLeastTerritory() {
  return useQuery({
    queryKey: ["user-least-territory"], // shared key with attendance report
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<TerritoryRow>>(
        LEAST_TERRITORY_URL
      );
      return body?.data ?? [];
    },
  });
}

// Legacy calls VERIFICATION_LIST with no query params. Filter UI exists but is
// not wired to the API — kept here for visual parity. Don't add params until
// the backend documents them.
export function useVerificationList() {
  return useQuery({
    queryKey: ["verification-list-tat"],
    queryFn: async (): Promise<VerificationRow[]> => {
      const body = await api.get<unknown, ApiResultResponse<VerificationRow>>(
        VERIFICATION_LIST_URL
      );
      return body?.result ?? [];
    },
  });
}
