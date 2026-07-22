import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApplicationDetail } from "./application-detail.types";

// Backend returns the detail under `result` (not `data`) — see .types.ts.
const APPLICATION_URL = "/alpha/v2/application";

interface ApplicationDetailResponse {
  result?: ApplicationDetail;
  data?: ApplicationDetail;
}

export function useApplicationDetail(id?: string) {
  return useQuery({
    queryKey: ["consumer-application-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<ApplicationDetail> => {
      const body = await api.get<unknown, ApplicationDetailResponse>(
        `${APPLICATION_URL}/${encodeURIComponent(id!)}`
      );
      return (body?.data ?? body?.result ?? body ?? {}) as ApplicationDetail;
    },
  });
}
