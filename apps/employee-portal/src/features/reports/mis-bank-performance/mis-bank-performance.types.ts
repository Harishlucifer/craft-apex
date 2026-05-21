// MIS Bank Performance — legacy /pages/MIS/BankPerformance.js
// POST /alpha/v1/report/bank-performance?{filters}
// Response: { dashboard: [...], bank_performance_list: [...] }

export interface BankPerformanceRow {
  bank_name?: string;
  loan_type?: string;
  leads_count?: number;
  loan_amount?: number | string;
  sanctioned_count?: number;
  sanctioned_amount?: number | string;
  disbursed_count?: number;
  disbursed_amount?: number | string;
}

export interface BankPerformanceCard {
  label?: string;
  count?: number | string;
  amount?: number | string;
}

export interface BankPerformanceResult {
  dashboard: BankPerformanceCard[];
  bank_performance_list: BankPerformanceRow[];
}

export interface BankPerformanceFilter {
  startDate?: string;
  endDate?: string;
}
