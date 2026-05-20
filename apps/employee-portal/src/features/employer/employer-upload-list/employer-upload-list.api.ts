import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmployerUploadRow } from "./employer-upload-list.types";

// Legacy: GetCall(APIENDPOINTS.MCA_MASTER + "/lender/upload") -> response.data.data
const URL = "/alpha/v1/employer/lender/upload";

export function useEmployerUploadList() {
  return useQuery({
    queryKey: ["employer-upload-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EmployerUploadRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as EmployerUploadRow[]) : [];
    },
  });
}
