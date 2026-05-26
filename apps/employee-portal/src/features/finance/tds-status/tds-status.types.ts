// Legacy /Components/PayableReceivableManagement/TDS/VendorTDSStatus.js
//   GET /alpha/v1/channel?status=3&page=N[&keyword=…]
//   Response body shape: { data: VendorTdsRow[], pagination: { total } }

export interface VendorTdsRelationshipManager {
  name?: string;
}

export interface VendorTdsRow {
  channel_id?: string | number;
  dsa_code?: string;
  name?: string;
  point_of_contact?: string;
  mobile?: string;
  onb_territory_name?: string;
  relationship_manager?: VendorTdsRelationshipManager;
  status_name?: string;
}

export interface VendorTdsPagination {
  total?: number;
}

export interface VendorTdsResponse {
  data: VendorTdsRow[];
  total: number;
}
