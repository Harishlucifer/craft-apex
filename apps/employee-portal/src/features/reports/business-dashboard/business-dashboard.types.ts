// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/BusinessDashboard.js
//
// LEGACY IS MOCK-ONLY: KPI cards, branch performance, chart series, and the
// deal-register table are all hard-coded in-component arrays. No useEffect,
// no API calls, no endpoints in ApiEndPoint.js. The filter selects render
// only the literal options "All / BANGALORE / CHENNAI" etc. with no state.
//
// Per the no-guessing rule we do NOT invent endpoints. Types mirror the
// verbatim shape of the legacy in-memory data.

export interface BusinessKpi {
  label: string;
  value: string;
  sub: string;
}

export interface BranchPerformance {
  branch: string;
  target: string;
  disbursed: string;
  files: number;
  achvmt: string;
  tone: "good" | "warn";
}

export interface MonthlyTargetPoint {
  month: string;
  target: number;
  actual: number;
}

export interface FyTrendPoint {
  month: string;
  prev: number;
  current: number;
}

export interface DealRow {
  id: string;
  branch: string;
  contractNo: string;
  customer: string;
  executive: string;
  vehicle: string;
  financeType: string;
  amount: string;
  irr: string;
  status:
    | "Disbursed"
    | "Approved"
    | "In Process"
    | "Deal Lost"
    | "Rejected";
  date: string;
}
