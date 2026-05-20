import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LenderPincodeUploadRow } from "./lender-pincode-list.types";

// Legacy: GetCall(APIENDPOINTS.LENDER_PINCODE_UPLOAD_LIST) -> response.data.data
const URL = "/alpha/v1/master/lender/pincode/uploads";

export function useLenderPincodeUploadList() {
  return useQuery({
    queryKey: ["lender-pincode-upload-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LenderPincodeUploadRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LenderPincodeUploadRow[]) : [];
    },
  });
}
