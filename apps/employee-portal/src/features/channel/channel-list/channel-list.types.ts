// Legacy craft-frontend/src/pages/Channel/ChannelList.js (+ wrappers in
// PartnerMgmt / VendorMgmt / ApfMgmt). All routes hit the same endpoint with
// different `status` and `journey_type` filters.
// GET /alpha/v1/channel?status=X&page=N[&journey_type=A|B][&exclude_journey_type=A|B]
//   -> { data: ChannelRow[]; pagination: { total } }

export interface ChannelRow {
  channel_id?: string | number | bigint;
  dsa_code?: string;
  name?: string;
  partner_category?: string;
  onb_territory_name?: string;
  point_of_contact?: string;
  mobile?: string;
  journey_type?: string;
  /** 1 InProgress, 2/4 ApprovalPending, 3 Approved, -1 Rejected, -2 Archived, -3 Inactive */
  status?: number | string;
  partner_type?: string;
  createdAt?: string;
}

export interface ChannelListResponse {
  data: ChannelRow[] | null;
  pagination: { total: number } | null;
}
