import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RejectedQResponse } from "./rejected-q.types";

// Legacy RejectedQ.js: `/alpha/v1/application/tracking?page=${page}&status=-1|-3`
async function getRejectedQ(page: number): Promise<RejectedQResponse> {
  return api.get<unknown, RejectedQResponse>(
    `/alpha/v1/application/tracking?page=${page}&status=-1|-3`
  );
}

export function useRejectedQ(page: number) {
  return useQuery({
    queryKey: ["rejected-q", page],
    queryFn: () => getRejectedQ(page),
    placeholderData: keepPreviousData,
  });
}
