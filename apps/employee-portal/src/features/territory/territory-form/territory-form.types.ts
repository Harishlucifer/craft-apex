// Legacy craft-frontend/src/pages/Configuration/Territory/{AddTerritory,TerritoryBoundaries,SelectTerritoryType}.js
//
// POST /alpha/v1/master/territory                  -> save
// GET  /alpha/v1/master/territory/{id}             -> { result: TerritoryDetail }
// GET  /alpha/v1/master/territory-type             -> territory type master
// GET  /alpha/v1/master/territory                  -> for parent territory list
// Lookups: LOCATION_TYPE, TERRITORY_BOUNDARY_TYPE
// Country/State/District + pincode/area lookup are scoped per location_type
// in legacy; we leave those as text inputs for the first pass.

export interface OfficeDetail {
  id?: string | number;
  name?: string;
  address?: string;
  contact_detail?: string;
  email?: string;
  pincode?: string;
  area_id?: string | number;
  latitude?: number;
  longitude?: number;
  status?: number;
}

export interface BoundaryCoordinate {
  latitude: number;
  longitude: number;
}

export interface TerritoryBoundary {
  id?: string | number;
  type: "RADIUS" | "GEO_FENCING" | string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  pincodes?: string[];
  coordinates?: BoundaryCoordinate[];
  status: number;
}

export interface TerritoryDetail {
  territory_id?: string | number;
  code?: string;
  name?: string;
  territory_name?: string;
  description?: string;
  territory_type_id?: string | number;
  parent_territory_id?: string | number;
  location_type?: string;
  location_type_value?: string | number;
  status?: number;
  office_detail?: OfficeDetail;
  territory_boundary?: TerritoryBoundary;
}

export interface TerritorySavePayload {
  territory_id?: string | number;
  code: string;
  territory_type_id: string | number;
  territory_name: string;
  name: string;
  description?: string;
  parent_territory_id?: string | number;
  status: number;
  location_type?: string;
  location_type_value?: string | number;
  office_detail?: OfficeDetail;
  territory_boundary?: TerritoryBoundary;
}

export interface TerritoryTypeRow {
  territory_type_id: string | number;
  territory_type_name: string;
}

export interface TerritoryRow {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}
