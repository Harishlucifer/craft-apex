// Legacy craft-frontend/src/pages/Channel/PartnerMgmt/NewChannelList.js
// GET /alpha/v1/channel?page=N (no status filter — all channels)
//   -> { data: ChannelRow[]; pagination: { total } }

export interface ChannelRow {
  channel_id?: string | number | bigint;
  dsa_code?: string;
  name?: string;
  mobile?: string;
  onb_territory_name?: string;
  status?: number | string;
  createdAt?: string;
}

export interface NewChannelListResponse {
  data: ChannelRow[] | null;
  pagination: { total: number } | null;
}
