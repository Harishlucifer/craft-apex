// Types verbatim from legacy:
//   /pages/PayableReceivableMgmt/VendorGSTListView.js
// Field names mirror what the legacy `columns` useMemo and `getChannelList`
// read off each row.

export interface VendorGstRow {
  channel_id?: string | number;
  name?: string;
  partner_category?: string;
  onb_territory_name?: string;
  point_of_contact?: string;
  mobile?: string;
  relationship_manager?: { name?: string };
  status_name?: string;
  created_at?: string;
  is_gst_defaulter?: 0 | 1;
}

export interface VendorGstPage {
  data: VendorGstRow[];
  total: number;
}
