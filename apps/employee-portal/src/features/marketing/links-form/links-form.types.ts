// Legacy craft-frontend/src/pages/Marketing/MarketingAssets/Links/addLinks.js
// POST /alpha/v1/marketing/link
// GET  /alpha/v1/marketing/link?link_id=X -> data.result[0]
// Lookup: /alpha/v1/lookup?group_code=CAMPAIGN_ATTRIBUTION
// Territory: /alpha/v1/master/territory
// Employees: /alpha/v2/master/employees

export interface LinkDetail {
  link_id?: string | number;
  name?: string;
  attribution?: string;
  level?: string;
  territory_id?: string | number | null;
  userType?: string;
  user_id?: string | number | null;
  status?: number;
  utm_tags?: Record<string, string> | null;
  short_url?: string;
  created_at?: string;
  update_at?: string;
}

export interface LinkSavePayload {
  link_id?: string | number;
  name: string;
  attribution: string;
  level: string;
  territory_id?: string | number | null;
  user_id?: string | number | null;
  userType?: string;
  status: number;
  utm_tags: Record<string, string>;
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
  lu_value?: string;
}

export interface TerritoryItem {
  territory_id: string | number;
  territory_name: string;
  territory_type_id?: string | number;
}

export interface EmployeeItem {
  user_id: string | number;
  name: string;
}
