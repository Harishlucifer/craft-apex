// MIS Daily Sales Report — legacy /pages/MIS/DailySalesReport.js
// + sub-components DailySalesReport/{SalesSummaryReport,DispositionDetails,PerformanceAnalysis}.
//
// Two endpoints:
//   GET /alpha/v1/report/daily-sales[?territory&start_date&end_date&userId]
//     -> { data: { sales: SalesRow[], dashboard: Record<string, number|string> } }
//   GET /alpha/v1/report/sales-disposition?scope=APPLICATION_FLOW[&territoryId&startDate&end_date&userId]
//     -> { data: DispositionRow[] }
//
// Note: the daily-sales endpoint uses `start_date`/`end_date` (snake_case)
// while the disposition stream uses `startDate`/`end_date` — keep both as is.

export interface SalesRow {
  name?: string;
  total_lead?: number;
  total_call?: number;
  total_visit?: number;
  followup_completed?: number;
  followup_due?: number;
  followup_overdue?: number;
  followup_upcoming?: number;
  latest_disposition?: number | string;
}

export interface DispositionRow {
  username?: string;
  loan_code?: string;
  lead_code?: string;
  lead_name?: string;
  activity_type?: string;
  outcome?: string;
  loan_status?: string;
  feedback?: string;
  created_at?: string;
  address?: string;
  remark?: string;
}

export interface DailySalesResult {
  sales: SalesRow[];
  /** Object map of outcome label → count, plus optional `total_leads`. */
  dashboard: Record<string, number | string>;
}

export interface DailySalesFilter {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}
