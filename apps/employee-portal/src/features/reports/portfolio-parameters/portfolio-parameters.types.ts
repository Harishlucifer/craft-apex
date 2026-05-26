// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/PortfolioParameters.js
//
// LEGACY IS MOCK-ONLY: KPI cards, LTV bucket chart series, IRR-by-product
// table, and branch target/ATS table are all hard-coded in-component arrays.
// No useEffect, no API calls, no endpoints in ApiEndPoint.js. "Refresh" and
// "Export PDF" buttons have no onClick.
//
// Per the no-guessing rule we do NOT invent endpoints. Types mirror the
// verbatim shape of the legacy in-memory data.

export interface PortfolioKpi {
  label: string;
  value: string;
  sub: string;
  color: "primary" | "success" | "info" | "warning" | "danger";
}

export interface LtvBucketPoint {
  bucket: string;
  pct: number;
}

export interface IrrByProductRow {
  product: string;
  new: string;
  refinance: string;
  used: string;
  takeover: string;
  avgLtv: string;
}

export interface BranchTargetRow {
  branch: string;
  target: string;
  ats: string;
  actual: string;
  ytdTarget: string;
  ytdActual: string;
  achievement: string;
}
