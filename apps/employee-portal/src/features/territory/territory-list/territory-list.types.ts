// Legacy craft-frontend/src/pages/Configuration/Territory/TerritoryList.js
// GET /alpha/v1/master/territory -> { data: TerritoryRow[] }

export interface TerritoryRow {
  territory_id?: string | number | bigint;
  territory_code?: string;
  territory_name?: string;
  parent_territory_name?: string;
  territory_type_name?: string;
  status?: number;
}
