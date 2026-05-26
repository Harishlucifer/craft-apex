import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LiveLocationResult,
  TerritoryRow,
} from "./live-tracking.types";

// Legacy ApiEndPoint.js:
//   LEAST_TERRITORY = /alpha/v1/user/least/territory
//   LIVE_LOCATION   = /alpha/v1/report/user-live-location
const LEAST_TERRITORY_URL = "/alpha/v1/user/least/territory";
const LIVE_LOCATION_URL = "/alpha/v1/report/user-live-location";

interface ApiDataResponse<T> {
  data: T | null;
}

export function useLeastTerritory() {
  return useQuery({
    queryKey: ["user-least-territory"],
    queryFn: async (): Promise<TerritoryRow[]> => {
      const body = await api.get<unknown, ApiDataResponse<TerritoryRow[]>>(
        LEAST_TERRITORY_URL
      );
      return body?.data ?? [];
    },
  });
}

export interface LiveLocationParams {
  territoryId?: Id;
  roleCode?: string;
}

type Id = string | number;

function buildLiveLocationUrl(p: LiveLocationParams): string {
  // Legacy builds the URL with double-`&&` between params when both are set —
  // not faithfully preserving that quirk; using a single `&`.
  const qs: string[] = [];
  if (p.territoryId != null && String(p.territoryId) !== "") {
    qs.push(`territoryId=${encodeURIComponent(String(p.territoryId))}`);
  }
  if (p.roleCode) qs.push(`role_code=${encodeURIComponent(p.roleCode)}`);
  return qs.length > 0 ? `${LIVE_LOCATION_URL}?${qs.join("&")}` : LIVE_LOCATION_URL;
}

export function useLiveLocations(params: LiveLocationParams) {
  return useQuery({
    queryKey: [
      "live-location",
      params.territoryId ?? "",
      params.roleCode ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LiveLocationResult> => {
      const body = await api.get<unknown, ApiDataResponse<LiveLocationResult>>(
        buildLiveLocationUrl(params)
      );
      return body?.data ?? {};
    },
  });
}
