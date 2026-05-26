import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LenderGstPage, LenderGstRow } from "./lender-gst.types";

// Legacy /Components/PayableReceivableManagement/Gst/GstDetails.js
//   For URL containing payableReceivableData.UrlTypeLender ('lender'),
//   associateType = "LENDER" and the call is:
//     GET ${APIENDPOINTS.GET_GST_LIST}?status=1&associate_type=LENDER
//   APIENDPOINTS.GET_GST_LIST = `${API_BASE_URL}/alpha/v1/finance/gst`
//
// Legacy reads `res.data?.data` — GetCall sets res.data = axios response, so
// the body shape is `{ status, data: Row[] }`. No pagination in legacy.
const URL = "/alpha/v1/finance/gst";
const ASSOCIATE_TYPE = "LENDER";

export function useLenderGstList() {
  const url = `${URL}?status=1&associate_type=${ASSOCIATE_TYPE}`;

  return useQuery({
    queryKey: ["lender-gst-list"],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<LenderGstPage> => {
      const body = await api.get<unknown, any>(url);
      const rows: LenderGstRow[] = Array.isArray(body?.data) ? body.data : [];
      return { data: rows, total: rows.length };
    },
  });
}
