import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VendorTdsResponse, VendorTdsRow } from "./tds-status.types";

// Legacy /Components/PayableReceivableManagement/TDS/VendorTDSStatus.js
//   apiUrl = `${APIENDPOINTS.CHANNEL_LIST}?status=3&page=${pageNo}[&keyword=…]`
//   APIENDPOINTS.CHANNEL_LIST → /alpha/v1/channel
//   (status=3 = approved partners; reused for TDS status view.)
const URL = "/alpha/v1/channel";
const APPROVED_STATUS = "3";

export function useVendorTdsStatusList(page: number, keyword: string) {
  const qs: string[] = [`status=${APPROVED_STATUS}`, `page=${page}`];
  if (keyword) qs.push(`keyword=${encodeURIComponent(keyword)}`);
  const url = `${URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: ["vendor-tds-status", page, keyword],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<VendorTdsResponse> => {
      const body = await api.get<unknown, any>(url);
      const rows: VendorTdsRow[] = Array.isArray(body?.data) ? body.data : [];
      const total: number = body?.pagination?.total ?? rows.length ?? 0;
      return { data: rows, total };
    },
  });
}
