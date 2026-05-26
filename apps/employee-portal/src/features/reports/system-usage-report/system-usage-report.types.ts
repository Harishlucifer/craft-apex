// System Usage Report — legacy /pages/Reports/UsageReport/PlatformUsageReport/index.js
// Route /reports/system-usage-report.
//
// GET /alpha/v1/report/usage-report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&platform=PLATFORM
//   -> { data: { result: {
//        dashboard:      UsageCard[],
//        usage_data:     UsageRow[],
//        platform_chart: { label: string; value: number }[],
//        line_chart:     { portal: string; list: { label: string; value: number }[] }[],
//      } } }
//
// Platform lookup: GET /alpha/v1/lookup?group_code=PLATFORM
//   -> { data: { data: LookupRow[] } }    (legacy reads res.data.data)
//
// Account revert (per-row action on the legacy table): POST /alpha/v1/user/user-revert
//   payload { user_id, platform } -> { status, data?: { error?: string } }

export interface UsageRow {
  user_id?: number | string;
  user_name?: string;
  mobile?: string;
  email?: string;
  user_type?: string;
  activity?: string;
  platform?: string;
  usage_count?: number | string;
  user_account_frozen?: boolean | number;
  recent_login?: string;
  created_at?: string;
}

export interface UsageCard {
  label?: string;
  value?: number | string;
}

export interface PlatformChartPoint {
  label?: string;
  value?: number | string;
}

export interface LinePortalSeries {
  portal?: string;
  list?: { label?: string; value?: number | string }[];
}

export interface UsageReportResult {
  dashboard: UsageCard[];
  usage_data: UsageRow[];
  platform_chart: PlatformChartPoint[];
  line_chart: LinePortalSeries[];
}

export interface UsageReportFilter {
  /** YYYY-MM-DD (matches legacy start_date / end_date query params). */
  startDate?: string;
  endDate?: string;
  /** Single lookup key (legacy stores one value at a time). */
  platform?: string;
}

export interface PlatformLookupItem {
  lu_key: string;
  lu_name: string;
}

/**
 * Legacy `formatLabel`: snake_case → Title Case. Used to render dashboard
 * card labels. (PlatformUsageReport index.js line 131.)
 */
export function formatLabel(label?: string): string {
  if (!label) return "—";
  return label
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
