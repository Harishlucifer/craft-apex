import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VendorGstPage, VendorGstRow } from "./vendor-gst.types";

// Legacy /pages/PayableReceivableMgmt/VendorGSTListView.js — getChannelList:
//   GET ${APIENDPOINTS.CHANNEL_LIST}?status=3&page=N[&keyword=…]
//   APIENDPOINTS.CHANNEL_LIST = `${API_BASE_URL}/alpha/v1/channel`
//   Response body shape: { data: { data: Row[], pagination: { total } } }
//   GetCall resolves to the body directly (response.data is the outer body).
const URL = "/alpha/v1/channel";
const APPROVED_STATUS = "3"; // legacy: status=3

export function useVendorGstList(page: number, keyword: string) {
  const qs: string[] = [`status=${APPROVED_STATUS}`, `page=${page}`];
  if (keyword) qs.push(`keyword=${encodeURIComponent(keyword)}`);
  const url = `${URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: ["vendor-gst-list", page, keyword],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<VendorGstPage> => {
      const body = await api.get<unknown, any>(url);
      const rows = Array.isArray(body?.data) ? body.data : [];
      const total = body?.pagination?.total ?? rows.length ?? 0;
      return { data: rows as VendorGstRow[], total };
    },
  });
}
