// Legacy: craft-frontend/src/pages/Reports/PddReports/PddDashBoard.js
//
// LEGACY IS PARTIAL MOCK: the product-tab list is fetched from the real
// LOAN_TYPE_MASTER endpoint (and counts are filled with Math.random as a
// placeholder comment in the legacy code). Everything else — KPIs, branch
// gap heatmap, case-detail table, donut + aging stack chart series — is
// hard-coded in-component arrays.
//
// Per the no-guessing rule we treat the page as mock-only in the new
// portal: the LOAN_TYPE_MASTER call is real in legacy, but until a shared
// loan-type hook exists in craft-apex we fall back to a built-in tab list
// rather than invent an endpoint contract.

export interface LoanTypeOption {
  id: string;
  name: string;
  /** Legacy fills this with Math.random — placeholder until counts ship. */
  count: number;
}

export interface PddKpi {
  label: string;
  value: string;
  sub: string;
  tone: "danger" | "warning";
}

export interface BranchGapRow {
  branch: string;
  invoice: number | null;
  rc: number | null;
  vehIns: number | null;
  pdc: number | null;
  /** [critical%, warning%, ok%] */
  agingMix: [number, number, number];
  status: "Critical";
}

export interface PddCaseRow {
  branch: string;
  contract: string;
  customer: string;
  executive: string;
  docType: "Invoice" | "RC" | "Veh. Ins." | "PDC";
  aging: number;
  agingLabel: "Critical" | "Warning" | "OK";
  disbDate: string;
  vehicle: string;
  status: "Pending" | "Received";
}

export interface DocSplitPoint {
  label: string;
  count: number;
  color: string;
}

export interface AgingByDocTypePoint {
  docType: string;
  critical: number;
  warning: number;
  ok: number;
}
