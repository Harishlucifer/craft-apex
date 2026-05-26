// Legacy: craft-frontend/src/pages/Reports/NpaReports/NpaDashboard.js
//
// LEGACY IS MOCK-ONLY — no API calls exist in the source. The legacy file
// hard-codes KPI cards, branch summary, NPA accounts, and chart series as
// in-component arrays. Nothing in ApiEndPoint.js backs this screen.
//
// Per the no-guessing rule we do NOT fabricate URLs, query params, or
// response shapes. This module exports only the verbatim mock data shipped
// in the legacy file.
//
// TODO(npa-dashboard): once backend endpoints exist, wrap api.get in React
// Query here (see mis-bank-performance.api.ts for the pattern).

import type {
  NpaAccount,
  NpaBranchSummary,
  NpaKpi,
  NpaSnapshotPoint,
  NpaTrendPoint,
} from "./npa-dashboard.types";

export const LEGACY_NPA_KPIS: NpaKpi[] = [
  { label: "Total Portfolio", value: "₹104.6Cr", sub: "2,342 live contracts", color: "primary" },
  { label: "Gross NPA", value: "3.84%", sub: "↑ 0.3% vs last month", color: "danger" },
  { label: "NPA Value", value: "₹4.02Cr", sub: "86 NPA contracts", color: "warning" },
  { label: "Provision Held", value: "₹1.61Cr", sub: "40% provision rate", color: "info" },
  { label: "Net NPA", value: "2.30%", sub: "after provision", color: "secondary" },
  { label: "Recovery Rate", value: "18.6%", sub: "from NPA accounts", color: "success" },
];

export const LEGACY_BRANCH_SUMMARY: NpaBranchSummary[] = [
  { branch: "TRICHY", npaConts: 3, os: 4.3, portfolio: 942.82, grossNpa: 0.46, barWidth: 99 },
  { branch: "SALEM", npaConts: 7, os: 17.96, portfolio: 879.86, grossNpa: 2.04, barWidth: 97 },
  { branch: "BANGALORE", npaConts: 12, os: 28.42, portfolio: 1244.74, grossNpa: 2.28, barWidth: 97 },
  { branch: "POONAMALLEE", npaConts: 8, os: 14.18, portfolio: 891.2, grossNpa: 1.59, barWidth: 98 },
  { branch: "COIMBATORE", npaConts: 6, os: 11.64, portfolio: 785.4, grossNpa: 1.48, barWidth: 98 },
  { branch: "VELLORE", npaConts: 5, os: 8.84, portfolio: 654.3, grossNpa: 1.35, barWidth: 98 },
  { branch: "CHENNAI", npaConts: 9, os: 18.62, portfolio: 986.5, grossNpa: 1.89, barWidth: 98 },
];

export const LEGACY_NPA_ACCOUNTS: NpaAccount[] = [
  { branch: "CUDDALORE", contract: "LCUD21886901", customer: "ARUGAM S", odBucket: "OD 4", fa: "₹5,16,824", fc: "₹2,58,412", futureRecv: "₹1,70,552", outstanding: "₹4,28,964", dminDate: "06/02/2024", status: "NPA" },
  { branch: "HOSUR", contract: "LH0S23886902", customer: "RAJENDHIRAN P", odBucket: "OD 3", fa: "₹7,87,841", fc: "₹2,59,988", futureRecv: "₹2,20,595", outstanding: "₹4,80,583", dminDate: "09/05/2025", status: "NPA" },
  { branch: "VELLORE", contract: "LVEL22886903", customer: "JAYAKODI V", odBucket: "OD 5", fa: "₹6,42,100", fc: "₹3,12,450", futureRecv: "₹1,95,200", outstanding: "₹5,10,320", dminDate: "12/08/2024", status: "NPA" },
  { branch: "CHENNAI", contract: "LCHE23886904", customer: "BASKARAN R", odBucket: "OD 2", fa: "₹4,80,500", fc: "₹1,98,200", futureRecv: "₹1,42,800", outstanding: "₹3,22,400", dminDate: "18/11/2024", status: "NPA" },
  { branch: "SALEM", contract: "LSAL21886905", customer: "ARUMUGAM S", odBucket: "OD 6", fa: "₹9,15,000", fc: "₹4,20,000", futureRecv: "₹2,80,000", outstanding: "₹6,50,000", dminDate: "03/01/2024", status: "NPA" },
];

export const LEGACY_NPA_TREND: NpaTrendPoint[] = [
  { year: "'20", grossNpaPct: 1.8 },
  { year: "'21", grossNpaPct: 2.4 },
  { year: "'22", grossNpaPct: 3.1 },
  { year: "'23", grossNpaPct: 3.6 },
  { year: "'24", grossNpaPct: 4.1 },
  { year: "'25", grossNpaPct: 3.84 },
];

export const LEGACY_NPA_SNAPSHOTS: NpaSnapshotPoint[] = [
  { week: "Oct 16th", npaConts: 78, outstandingLakhs: 380 },
  { week: "Oct 23rd", npaConts: 82, outstandingLakhs: 410 },
  { week: "Oct 30th", npaConts: 86, outstandingLakhs: 450 },
];
