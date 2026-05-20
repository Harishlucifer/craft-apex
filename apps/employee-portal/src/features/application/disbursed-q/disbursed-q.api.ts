import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DisbursedQResponse } from "./disbursed-q.types";

// Legacy DisbursedQ.js: `/alpha/v1/application/tracking?page=${page}&status=4`
async function getDisbursedQ(page: number): Promise<DisbursedQResponse> {
  return api.get<unknown, DisbursedQResponse>(
    `/alpha/v1/application/tracking?page=${page}&status=4`
  );
}

export function useDisbursedQ(page: number) {
  return useQuery({
    queryKey: ["disbursed-q", page],
    queryFn: () => getDisbursedQ(page),
    placeholderData: keepPreviousData,
  });
}
