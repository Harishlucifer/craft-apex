// MIS Month-Wise Performance — legacy /pages/MIS/MonthWisePerformance/index.js
// POST /alpha/v1/report/month-performance?{filters}
// Response: { dashboard, month_performance_data, month_wise, lead_by_loan_type }
// (Charts month_wise + lead_by_loan_type are deferred; we render cards + table.)

export interface MonthWiseRow {
  month_year?: string;
  loan_type?: string;
  leads_count?: number;
  loan_amount?: number | string;
  sanctioned_count?: number;
  sanctioned_amount?: number | string;
  disbursed_count?: number;
  disbursed_amount?: number | string;
}

export interface MonthWiseCard {
  label?: string;
  count?: number | string;
  amount?: number | string;
}

export interface MonthWiseResult {
  dashboard: MonthWiseCard[];
  month_performance_data: MonthWiseRow[];
}

export interface MonthWiseFilter {
  startDate?: string;
  endDate?: string;
}
