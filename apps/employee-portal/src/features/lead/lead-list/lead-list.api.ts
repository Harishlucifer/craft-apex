import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LeadListResponse, LeadListScope } from "./lead-list.types";

// Legacy: `/alpha/v2/application?page=${page}&exclude_journey_type=VERIFICATION`
// + `&status=3` (FULFILLED) | `&status=-1` (ARCHIVED).
function buildUrl(page: number, scope: LeadListScope): string {
  let url = `/alpha/v2/application?page=${page}&exclude_journey_type=VERIFICATION`;
  if (scope === "FULFILLED") url += "&status=3";
  if (scope === "ARCHIVED") url += "&status=-1";
  return url;
}

async function getLeadList(
  page: number,
  scope: LeadListScope
): Promise<LeadListResponse> {
  return api.get<unknown, LeadListResponse>(buildUrl(page, scope));
}

export function useLeadList(page: number, scope: LeadListScope) {
  return useQuery({
    queryKey: ["lead-list", scope, page],
    queryFn: () => getLeadList(page, scope),
    placeholderData: keepPreviousData,
  });
}
