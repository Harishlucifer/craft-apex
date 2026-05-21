import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy /pages/PayableReceivableMgmt/GstStatus/ListView.js
//   GET /alpha/v1/channel?status=3&page=N[&keyword=…]
//   (status=3 = partnerRegistrationStatus.Approved)
//   Response: { data: PartnerRow[], pagination: { total } }
const URL = "/alpha/v1/channel";
const APPROVED_STATUS = "3";

export interface GstStatusRow {
  channel_id?: string | number;
  dsa_code?: string;
  name?: string;
  partner_category?: string;
  onb_territory_name?: string;
  point_of_contact?: string;
  mobile?: string;
  relationship_manager?: { name?: string };
  status?: number | string;
  created_at?: string;
  is_gst_defaulter?: 0 | 1;
}

export interface GstStatusPage {
  data: GstStatusRow[];
  total: number;
}

export function useGstStatusList(page: number, keyword: string) {
  const qs: string[] = [`status=${APPROVED_STATUS}`, `page=${page}`];
  if (keyword) qs.push(`keyword=${encodeURIComponent(keyword)}`);
  const url = `${URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: ["gst-status-list", page, keyword],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<GstStatusPage> => {
      const body = await api.get<unknown, any>(url);
      const rows = Array.isArray(body?.data) ? body.data : [];
      const total = body?.pagination?.total ?? rows.length ?? 0;
      return { data: rows as GstStatusRow[], total };
    },
  });
}
