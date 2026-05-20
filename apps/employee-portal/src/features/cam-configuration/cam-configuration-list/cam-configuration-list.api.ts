import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CamConfigRow } from "./cam-configuration-list.types";

// Legacy: GetCall(APIENDPOINTS.CAM_CONFIGURATION) -> response.data.result
const URL = "/alpha/v1/master/cam-configuration";

export function useCamConfigList() {
  return useQuery({
    queryKey: ["cam-configuration-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CamConfigRow[]> => {
      const body = await api.get<unknown, any>(URL);
      const arr = body?.result ?? body?.data ?? body;
      return Array.isArray(arr) ? (arr as CamConfigRow[]) : [];
    },
  });
}
