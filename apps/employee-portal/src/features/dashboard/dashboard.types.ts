// Exact shape from legacy craft-frontend/src/Components/Common/Dashboard/index.js
// + pages/DashboardLeads/Widgets.js
// GET /alpha/v1/dashboard/summary?from_date=&to_date=[&exclude_journey_type=]
// Legacy: setLeadSummary(result.lead ?? result); setLenderWiseSummary(result.lender)

export interface SummaryWidget {
  name: string;
  count: number;
  /** 0–100, drives the ring */
  percentage: number;
  /** legacy: passed as router state when navigating from a card */
  filter?: unknown;
  route?: string;
}

interface ResultShape {
  lead?: SummaryWidget[];
  lender?: SummaryWidget[];
}

export interface DashboardResponse {
  status?: boolean;
  result?: ResultShape | SummaryWidget[];
  // envelope-tolerant (some endpoints wrap under `data`)
  data?: { status?: boolean; result?: ResultShape | SummaryWidget[] };
}

export interface DashboardData {
  lead: SummaryWidget[];
  lender: SummaryWidget[];
}
