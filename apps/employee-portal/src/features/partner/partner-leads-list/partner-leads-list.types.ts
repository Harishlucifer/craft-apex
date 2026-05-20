// Legacy craft-frontend/src/pages/Channel/PartnerLeads.js
// GET /alpha/v1/channel?status=3&download=false&page=N
//   -> { data: PartnerLeadRow[]; pagination: { total } }

export interface PartnerLeadRow {
  channel_id?: string | number | bigint;
  dsa_code?: string;
  name?: string;
  point_of_contact?: string;
  mobile?: string;
  status?: number | string;
}

export interface PartnerLeadsResponse {
  data: PartnerLeadRow[] | null;
  pagination: { total: number } | null;
}
