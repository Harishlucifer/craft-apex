import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  TerritoryDetail,
  TerritoryRow,
  TerritoryTypeRow,
} from "./territory-form.types";

const TERRITORY_URL = "/alpha/v1/master/territory";
const TERRITORY_TYPE_URL = "/alpha/v1/master/territory-type";

export function useTerritoryTypes() {
  return useQuery({
    queryKey: ["territory-type-master"],
    queryFn: async (): Promise<TerritoryTypeRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_TYPE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryTypeRow[]) : [];
    },
  });
}

export function useTerritoryParents() {
  return useQuery({
    queryKey: ["territory-master"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, any>(TERRITORY_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as TerritoryRow[]) : [];
    },
  });
}

export function useTerritoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["territory-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<TerritoryDetail | null> => {
      const body = await api.get<unknown, any>(
        `${TERRITORY_URL}/${encodeURIComponent(id!)}`,
      );
      const r = body?.result ?? body?.data ?? body;
      return (r ?? null) as TerritoryDetail | null;
    },
  });
}
