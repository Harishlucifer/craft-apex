// MIS Source Productivity — legacy /pages/MIS/SourceProductivity.js
// POST /alpha/v1/report/source-productivity?{filters}
// Response: { dashboard: [...], sourced_productivity_data: [...] }

export interface SourceProductivityRow {
  sourced_by_name?: string;
  sourced_by_type?: string;
  loan_type?: string;
  leads_count?: number;
  loan_amount?: number | string;
  sanctioned_count?: number;
  sanctioned_amount?: number | string;
  disbursed_count?: number;
  disbursed_amount?: number | string;
}

export interface SourceProductivityCard {
  label?: string;
  count?: number | string;
  amount?: number | string;
}

export interface SourceProductivityResult {
  dashboard: SourceProductivityCard[];
  sourced_productivity_data: SourceProductivityRow[];
}

export interface SourceProductivityFilter {
  startDate?: string;
  endDate?: string;
}
