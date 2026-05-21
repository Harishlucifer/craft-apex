import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TrackingQResponse } from "../tracking-q/tracking-q.types";

// Legacy /pages/Application/ApprovalQ.js
//   GET /alpha/v1/application/tracking?status=-2&page=N
// Same response shape as TrackingQ — only the status filter differs.
async function getApprovalQ(page: number): Promise<TrackingQResponse> {
  return api.get<unknown, TrackingQResponse>(
    `/alpha/v1/application/tracking?status=-2&page=${page}`
  );
}

export function useApprovalQ(page: number) {
  return useQuery({
    queryKey: ["approval-q", page],
    queryFn: () => getApprovalQ(page),
    placeholderData: keepPreviousData,
  });
}
