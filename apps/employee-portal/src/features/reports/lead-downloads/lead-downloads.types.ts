// Lead Downloads / Lead Status — legacy /pages/Reports/LeadDownloads.js
// Two pieces:
//   1. POST /alpha/v1/report/application  — submit an export request
//      body: { type, date_type, start_date, end_date, loan_type_id,
//              application_type, all_data }
//      (start_date / end_date in YYYY-MM-DD; legacy converts DD/MM/YYYY → YYYY-MM-DD.)
//   2. GET  /alpha/v1/report  — request-list polling table.
//      response: { data: { data: ReportRequestRow[] } }
//
// Lookups:
//   GET /alpha/v1/user/loan-type?status=1  (loan type select)
//   GET /alpha/v1/master/journey-type/group (filtered by loan code, workflow_type=LEAD_CREATION)

export type DateTypeValue =
  | "CREATED_AT"
  | "APPROVED_AT"
  | "DISBURSED_AT"
  | "LENDER_LOGIN_AT";

export interface DateTypeOption {
  value: DateTypeValue;
  label: string;
}

// Legacy: LeadDownloads.js lines 40-53.
export const DATE_TYPE_OPTIONS: DateTypeOption[] = [
  { value: "CREATED_AT", label: "Created On" },
  { value: "APPROVED_AT", label: "Approved On" },
  { value: "DISBURSED_AT", label: "Disbursed On" },
  { value: "LENDER_LOGIN_AT", label: "Lender Logged on" },
];

export interface LoanTypeOption {
  id: number | string;
  name: string;
  code: string;
}

export interface JourneyTypeRaw {
  name: string;
  code: string;
  workflow_type?: string;
}

export interface JourneyTypeOption {
  value: string;
  label: string;
}

export interface ReportRequestRow {
  report_request_id: number | string;
  request?: unknown;
  start_date?: string;
  end_date?: string;
  report_status?: string;
  status?: number;
  download?: string;
  type?: string;
}

export interface LeadExportPayload {
  type: string;
  date_type: DateTypeValue | "";
  start_date: string;
  end_date: string;
  loan_type_id: string;
  application_type: string;
  all_data: boolean;
}

export interface LeadExportFilter {
  reportType: string;
  dateType: DateTypeValue | "";
  loanType: string; // id stringified
  loanCode?: string;
  journeyType: string;
  startDate: string; // YYYY-MM-DD (date input)
  endDate: string; // YYYY-MM-DD
  allData: "yes" | "no";
}

// Default = legacy initial values (reportType=APPLICATION_REPORT_RAW, rest empty).
export const DEFAULT_LEAD_EXPORT_FILTER: LeadExportFilter = {
  reportType: "APPLICATION_REPORT_RAW",
  dateType: "",
  loanType: "",
  loanCode: undefined,
  journeyType: "",
  startDate: "",
  endDate: "",
  allData: "no",
};
