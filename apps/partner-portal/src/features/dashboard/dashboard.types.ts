// Partner dashboard summary.
//
// Legacy: channel-flexi/src/Components/Common/Dashboard/index.js
//         + Components/Common/Dashboard/DashboardSummary.js
//         + Components/Common/Dashboard/DashboardFilter.js
// Endpoint: GET /alpha/v1/dashboard/summary?from_date=&to_date=[&exclude_journey_type=]
//           (legacy APIENDPOINTS.GET_DASHBOARD_SUMMARY)
//
// Legacy consumes: response.data.result.lead ?? response.data.result   → lead widgets
//                  response.data.result.lender                          → lender widgets
// (the legacy axios interceptor returns response.data, so `result` sits at the body root;
//  craft-apex's interceptor does the same — the `data` nesting below is envelope tolerance.)

/** One summary card. `filter` is passed straight through as router state. */
export interface SummaryWidget {
  name: string;
  count: number;
  /** 0–100 — drives the progress ring */
  percentage: number;
  /** loan-status filter fragment merged into `filterData` on navigate */
  filter?: Record<string, unknown>;
  route?: string;
}

interface ResultShape {
  lead?: SummaryWidget[];
  lender?: SummaryWidget[];
}

export interface DashboardSummaryResponse {
  status?: boolean | number;
  result?: ResultShape | SummaryWidget[] | null;
  /** envelope tolerance — some deployments wrap the payload under `data` */
  data?: { status?: boolean | number; result?: ResultShape | SummaryWidget[] | null };
}

export interface DashboardSummaryData {
  lead: SummaryWidget[];
  lender: SummaryWidget[];
}

/** Router state pushed on card click — legacy DashboardSummary.handleCardClick. */
export interface DashboardFilterState {
  date_type: "created_date";
  start_date: string;
  end_date: string;
  [key: string]: unknown;
}
