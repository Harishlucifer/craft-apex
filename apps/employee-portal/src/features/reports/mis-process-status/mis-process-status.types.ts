// MIS Process Status — legacy /pages/MIS/ProcessStatus/index.js
// POST /alpha/v1/report/process-report?{filters}
// Response: { process_report_list, loan_type, summary }
// (Loan-type donut chart is deferred; we render summary cards + table.)

export interface ProcessStatusRow {
  application_code?: string;
  application_name?: string;
  sourced_by_name?: string;
  sourcing_channel_id?: string | number;
  sourcing_channel_name?: string;
  loan_type_name?: string;
  application_loan_amount?: number | string;
  application_status_string?: string;
  territory_ground_name?: string;
  lender_name?: string;
  lender_apply_status_string?: string;
  disbursed_amount?: number | string;
  disbursed_date?: string;
  application_created_at?: string;
  application_updated_at?: string;
}

export interface ProcessStatusSummary {
  label?: string;
  value?: number | string;
}

export interface ProcessStatusResult {
  process_report_list: ProcessStatusRow[];
  summary: ProcessStatusSummary[];
}

export interface ProcessStatusFilter {
  startDate?: string;
  endDate?: string;
}
