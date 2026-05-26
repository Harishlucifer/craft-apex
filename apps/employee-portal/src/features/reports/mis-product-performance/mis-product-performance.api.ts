import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ProductPerformanceFilter,
  ProductPerformanceResult,
} from "./mis-product-performance.types";

// Legacy ApiEndPoint.js:
//   MIS_REPORTS_PRODUCT_PERFORMANCE = /alpha/v1/report/product-performance
// Called via PostCall in FetchAndFormik.js with the filter query string
// appended. Response body shape: { result: { ... } }.
const URL = "/alpha/v1/report/product-performance";

interface ResultEnvelope {
  result?: Partial<ProductPerformanceResult> | null;
  data?: { result?: Partial<ProductPerformanceResult> | null } | null;
}

export function useProductPerformance(filter: ProductPerformanceFilter) {
  const qs: string[] = [];
  if (filter.startDate) qs.push(`start_date=${encodeURIComponent(filter.startDate)}`);
  if (filter.endDate) qs.push(`end_date=${encodeURIComponent(filter.endDate)}`);
  const url = qs.length > 0 ? `${URL}?${qs.join("&")}` : URL;

  return useQuery({
    queryKey: [
      "mis-product-performance",
      filter.startDate ?? "",
      filter.endDate ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ProductPerformanceResult> => {
      const body = await api.post<unknown, ResultEnvelope>(url, {});
      const r = body?.result ?? body?.data?.result ?? null;
      return {
        dashboard: Array.isArray(r?.dashboard) ? r!.dashboard! : [],
        product_performance_data: Array.isArray(r?.product_performance_data)
          ? r!.product_performance_data!
          : [],
        loan_amount_chart: Array.isArray(r?.loan_amount_chart)
          ? r!.loan_amount_chart!
          : [],
        loan_type_chart: Array.isArray(r?.loan_type_chart)
          ? r!.loan_type_chart!
          : [],
      };
    },
  });
}
