import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PartnerExportPayload,
  PartnerRow,
} from "./partner-downloads.types";

// Legacy: POST /alpha/v1/report/partner?start_date=...&end_date=...&status=...
// (Method is POST in legacy though no body; mirrors that.)
const PARTNER_REPORT_URL = "/alpha/v1/report/partner";

interface ApiDataEnvelope<T> {
  status?: number | boolean;
  data?: T;
  message?: string;
}

export function usePartnerExport() {
  return useMutation({
    mutationFn: async (payload: PartnerExportPayload): Promise<PartnerRow[]> => {
      const qs = new URLSearchParams();
      if (payload.startDate) qs.set("start_date", payload.startDate);
      if (payload.endDate) qs.set("end_date", payload.endDate);
      if (payload.status) qs.set("status", payload.status);
      const url = qs.toString()
        ? `${PARTNER_REPORT_URL}?${qs.toString()}`
        : PARTNER_REPORT_URL;
      const body = await api.post<unknown, ApiDataEnvelope<PartnerRow[]>>(
        url,
        {}
      );
      return Array.isArray(body?.data) ? (body!.data as PartnerRow[]) : [];
    },
  });
}
