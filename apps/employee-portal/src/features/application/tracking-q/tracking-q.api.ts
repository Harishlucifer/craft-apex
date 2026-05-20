import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TrackingQResponse } from "./tracking-q.types";

// Legacy TrackingQ.js: `/alpha/v1/application/tracking?status=1|2|3&page=${page}`
async function getTrackingQ(page: number): Promise<TrackingQResponse> {
  return api.get<unknown, TrackingQResponse>(
    `/alpha/v1/application/tracking?status=1|2|3&page=${page}`
  );
}

export function useTrackingQ(page: number) {
  return useQuery({
    queryKey: ["tracking-q", page],
    queryFn: () => getTrackingQ(page),
    placeholderData: keepPreviousData,
  });
}
