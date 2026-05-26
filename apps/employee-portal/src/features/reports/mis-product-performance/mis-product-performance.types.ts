// Exact shapes from legacy craft-frontend/src/pages/MIS/ProductPerformance/.
// Single endpoint POST /alpha/v1/report/product-performance with optional
// filter query string; response body shape: { result: { ... } } per
// FetchAndFormik.js.

export interface DashboardCard {
  label?: string;
  count?: number | string;
  amount?: number | string;
}

export interface ProductPerformanceRow {
  loan_type?: string;
  loan_category?: string;
  leads_count?: number | string;
  loan_amount?: number | string;
  sanctioned_count?: number | string;
  sanctioned_amount?: number | string;
  disbursed_count?: number | string;
  disbursed_amount?: number | string;
}

// Bar chart: 3 series (Total/Sanctioned/Disbursed amount) plotted against label.
export interface LoanAmountChartPoint {
  label?: string;
  loan_amount?: number;
  sanctioned_amount?: number;
  disbursed_amount?: number;
}

// Donut chart: per-loan-type lead count.
export interface LoanTypeChartPoint {
  label?: string;
  value?: number;
}

export interface ProductPerformanceResult {
  dashboard: DashboardCard[];
  product_performance_data: ProductPerformanceRow[];
  loan_amount_chart: LoanAmountChartPoint[];
  loan_type_chart: LoanTypeChartPoint[];
}

export interface ProductPerformanceFilter {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
}
