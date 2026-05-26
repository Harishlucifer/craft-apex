// Exact shapes from legacy craft-frontend/src/pages/ActivityTracking/LiveTracking.js.
// Endpoints (resolved from ApiEndPoint.js):
//   LEAST_TERRITORY = /alpha/v1/user/least/territory   -> body.data: TerritoryRow[]
//   LIVE_LOCATION   = /alpha/v1/report/user-live-location -> body.data: LiveLocationResult
//
// Note: only the map + employee-status panel is ported. Legacy also includes
// TerritoryTree (left sidebar) and EmployeeList (right sidebar) and a filter
// drawer — those are deferred as Phase 7 sub-items.

export type Id = string | number;

export interface TerritoryRow {
  id: Id;
  name: string;
}

export interface UserLocation {
  user_id: Id;
  username: string;
  latitude: number | string;
  longitude: number | string;
  /** "GREEN" | "ORANGE" | "RED" — legacy mapping below. */
  color?: string;
}

export interface BranchLocation {
  name: string;
  latitude: number;
  longitude: number;
  /** Radius in **kilometers**; legacy renders Circle radius = distance * 1000 (m). */
  distance?: number;
}

export interface UserStatusCounts {
  active?: number;
  idle?: number;
  inactive?: number;
}

export interface LiveLocationResult {
  user?: UserLocation[];
  user_status?: UserStatusCounts;
  branch?: BranchLocation[];
}
