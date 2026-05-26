// Legacy: craft-frontend/src/pages/TargetMgmt/TargetReport/index.js (SalesPerformanceOverview)
//   GET  /alpha/v2/master/employees?keyword=…&page=…&size=10   (NEW_EMPLOYEE_LIST)
//        -> response.data.data: { employee_id, name, employee_code, ... }[]
//   POST /alpha/v1/report/employee-targets                     (EMPLOYEE_TARGET_REPORT)
//        body: { employee_id, month, year }
//        -> response.data.result: TargetReportResult
//   Field names below are verbatim from SummaryCards/Daily/Weekly/MonthlyPerformance.

export interface EmployeeOption {
  employee_id: string | number;
  name?: string;
  employee_code?: string;
}

export interface EmployeeListResponse {
  data?: {
    data?: EmployeeOption[];
  };
}

export interface MetricCell {
  target_attribute?: string;
  target_type?: "AMOUNT" | "COUNT" | string;
  target_period?: "MONTHLY" | "WEEKLY" | "DAILY" | "YEARLY" | string;
  target_value?: number | string;
  achieved_value?: number | string;
  variation_value?: number | string;
  achieved_percentage_str?: string;
}

export interface SummaryCard extends MetricCell {}

export interface DailyRow {
  day_number?: number | string;
  day?: string;
  is_today?: boolean;
  is_future?: boolean;
  metrics?: MetricCell[];
}

export interface DailyPerformance {
  month?: string;
  year?: string;
  metrics?: MetricCell[];
  daily_data?: DailyRow[];
}

export interface WeeklyRow {
  week_label?: string;
  date_range?: string;
  is_wtd?: boolean;
  is_future?: boolean;
  metrics?: MetricCell[];
}

export interface WeeklyPerformance {
  month?: string;
  year?: string;
  metrics?: MetricCell[];
  weekly_data?: WeeklyRow[];
}

export interface MonthlyPerformance {
  month?: string;
  year?: string;
  mtd_days?: number | string;
  metrics?: MetricCell[];
}

export interface TargetReportResult {
  summary_cards?: SummaryCard[];
  daily_performance?: DailyPerformance;
  weekly_performance?: WeeklyPerformance;
  monthly_performance?: MonthlyPerformance;
}

export interface TargetReportResponse {
  data?: {
    result?: TargetReportResult;
  };
}

export interface TargetReportPayload {
  employee_id: string | number;
  month: string; // "MM"
  year: string;  // "YYYY"
}
