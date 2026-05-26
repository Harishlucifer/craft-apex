// Legacy: craft-frontend/src/pages/Reports/NpaReports/NpaDashboard.js
//
// LEGACY IS MOCK-ONLY: the legacy component declares `kpis`, `branchSummary`,
// `npaAccounts`, `trendOptions`, `snapshotOptions` all as in-component
// const arrays. There are no API calls, no endpoints in ApiEndPoint.js, no
// useEffect fetches. Filter state (`branch`, `odBucket`) is local useState
// only.
//
// Per the no-guessing rule we do NOT invent endpoints. Types below mirror
// the verbatim shape of the legacy in-memory data.

export interface NpaKpi {
  label: string;
  value: string;
  sub: string;
  color: "primary" | "danger" | "warning" | "info" | "secondary" | "success";
}

export interface NpaBranchSummary {
  branch: string;
  npaConts: number;
  os: number;
  portfolio: number;
  grossNpa: number;
  barWidth: number;
}

export interface NpaAccount {
  branch: string;
  contract: string;
  customer: string;
  odBucket: string;
  fa: string;
  fc: string;
  futureRecv: string;
  outstanding: string;
  dminDate: string;
  status: string;
}

export interface NpaTrendPoint {
  year: string;
  grossNpaPct: number;
}

export interface NpaSnapshotPoint {
  week: string;
  npaConts: number;
  outstandingLakhs: number;
}
