// MIS Pendency Report — legacy /pages/MIS/PendencyReports.js
// POST /alpha/v1/report/pendency-report?{filters}
// Response shape (from FetchAndFormik.js — response.data.result):
//   { dashboard: PendencyDashboardCard[], pendency_report_data: PendencyRow[] }

export interface PendencyDashboardCard {
  label?: string;
  count?: number | string;
  amount?: number | string;
}

export interface PendencyRow {
  from_to?: string;
  lead_submission_pending_count?: number;
  lead_submission_pending_amount?: number | string;
  lead_processing_pending_count?: number;
  lead_processing_pending_amount?: number | string;
  bank_submission_pending_count?: number;
  bank_submission_pending_amount?: number | string;
  pending_with_bank_count?: number;
  pending_with_bank_amount?: number | string;
  pending_for_disbursement_count?: number;
  pending_for_disbursement_amount?: number | string;
}

export interface PendencyReportResult {
  dashboard: PendencyDashboardCard[];
  pendency_report_data: PendencyRow[];
}

export interface PendencyReportFilter {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}
