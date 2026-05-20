import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VerificationTypeRow } from "./verification-type-list.types";

// Legacy: GetCall(APIENDPOINTS.VERIFICATION_CATEGORY + "/list") -> response.data.data
const URL = "/alpha/v1/verification/category/list";

export function useVerificationTypeList() {
  return useQuery({
    queryKey: ["verification-type-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<VerificationTypeRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as VerificationTypeRow[]) : [];
    },
  });
}
