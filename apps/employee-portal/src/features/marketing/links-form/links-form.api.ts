import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeItem,
  LinkDetail,
  LinkSavePayload,
  LookupItem,
  TerritoryItem,
} from "./links-form.types";

const LINK_URL = "/alpha/v1/marketing/link";
const LOOKUP_URL = "/alpha/v1/lookup?group_code=CAMPAIGN_ATTRIBUTION";
const TERRITORY_URL = "/alpha/v1/master/territory";
const EMPLOYEES_URL = "/alpha/v2/master/employees";

export function useAttributionLookups() {
  return useQuery({
    queryKey: ["lookup", "CAMPAIGN_ATTRIBUTION"],
    queryFn: async (): Promise<LookupItem[]> => {
      const body = await api.get<unknown, any>(LOOKUP_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as LookupItem[]) : [];
    },
  });
}

export function useTerritoryOptions() {
  return useQuery({
    queryKey: ["territory-master"],
    queryFn: async (): Promise<TerritoryItem[]> => {
      const body = await api.get<unknown, any>(TERRITORY_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryItem[]) : [];
    },
  });
}

export function useEmployeeOptions(query?: string) {
  return useQuery({
    queryKey: ["employees-list", query ?? ""],
    queryFn: async (): Promise<EmployeeItem[]> => {
      const url = query ? `${EMPLOYEES_URL}?${query}` : EMPLOYEES_URL;
      const body = await api.get<unknown, any>(url);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as EmployeeItem[]) : [];
    },
  });
}

export function useLinkDetail(linkId: string | number | undefined) {
  return useQuery({
    queryKey: ["marketing-link-detail", String(linkId ?? "")],
    enabled: Boolean(linkId),
    queryFn: async (): Promise<LinkDetail | null> => {
      const body = await api.get<unknown, any>(
        `${LINK_URL}?link_id=${encodeURIComponent(String(linkId))}`
      );
      const arr = body?.result ?? body?.data ?? body;
      const first = Array.isArray(arr) ? (arr[0] as LinkDetail) : null;
      return first ?? null;
    },
  });
}

export function useSaveLink() {
  return useMutation({
    mutationFn: async (payload: LinkSavePayload) =>
      api.post<unknown, unknown>(LINK_URL, payload),
  });
}
