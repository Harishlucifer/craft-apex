import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@craft-apex/ui";

/**
 * Reusable CSV/XLSX export hook for legacy report pages.
 *
 * Legacy contract (UserLoginReport.exportUserLogin, others):
 *   GET /alpha/v1/report/export/:report_type?{filterQueryString}
 *   -> { status: 1, download_url }
 *
 * Triggers an anchor download when the backend returns `download_url`.
 */
export function useReportExport(reportType: string, fileName: string) {
  const [loading, setLoading] = useState(false);

  const exportNow = async (params?: Record<string, string | number | undefined>) => {
    setLoading(true);
    try {
      const qs = params
        ? Object.entries(params)
            .filter(([, v]) => v != null && v !== "")
            .map(
              ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
            )
            .join("&")
        : "";
      const url = `/alpha/v1/report/export/${encodeURIComponent(reportType)}${
        qs ? `?${qs}` : ""
      }`;
      const body = await api.get<unknown, any>(url);
      const downloadUrl: string | undefined = body?.download_url;
      if (!downloadUrl || body?.status !== 1) {
        toast.error(body?.message ?? "Export API did not return a download URL");
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return { exportNow, loading };
}
