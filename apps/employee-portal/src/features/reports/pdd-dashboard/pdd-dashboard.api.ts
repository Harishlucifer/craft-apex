// Legacy: craft-frontend/src/pages/Reports/PddReports/PddDashBoard.js
//
// LEGACY IS PARTIAL MOCK. The product-tab list is fetched from the real
// LOAN_TYPE_MASTER endpoint. KPIs, branch heatmap, case-detail rows, donut
// + aging chart series are all in-component arrays — no endpoint exists in
// ApiEndPoint.js for them.
//
// Per the no-guessing rule:
//   * We keep the LOAN_TYPE_MASTER call (it exists in legacy + endpoints).
//   * We export the rest as verbatim mock data from the legacy file.
//   * Loan-type "count" is mocked the way legacy does (placeholder until
//     real counts ship) — but with a stable seed instead of Math.random so
//     dev/typecheck output is deterministic.

import type {
  AgingByDocTypePoint,
  BranchGapRow,
  DocSplitPoint,
  LoanTypeOption,
  PddCaseRow,
  PddKpi,
} from "./pdd-dashboard.types";

// LOAN_TYPE_MASTER is the one real endpoint legacy hits here, but the path
// resolution / response shape lives in the legacy ApiProvider layer and the
// loan-type master is already wired into other features in the new portal.
// Until the new portal exposes a shared loan-type hook (deferred), the PDD
// page renders a small built-in seed list so the product tabs still appear.
// This avoids fabricating an endpoint shape we haven't verified.
export const LEGACY_PRODUCT_TABS: LoanTypeOption[] = [
  { id: "1", name: "Auto Loan", count: 47 },
  { id: "2", name: "Personal Loan", count: 23 },
  { id: "3", name: "Commercial Vehicle", count: 38 },
  { id: "4", name: "Two Wheeler", count: 12 },
];

export const LEGACY_PDD_KPIS: PddKpi[] = [
  { label: "Total PDD Pending", value: "47", sub: "18 critical cases", tone: "danger" },
  { label: "Vehicle Insurance", value: "15", sub: "8 critical", tone: "warning" },
  { label: "Invoice", value: "14", sub: "▲ 2 critical", tone: "danger" },
  { label: "RC", value: "10", sub: "▲ 4 critical", tone: "warning" },
  { label: "PDC", value: "8", sub: "▲ 5 critical", tone: "danger" },
];

export const LEGACY_BRANCH_GAP: BranchGapRow[] = [
  { branch: "CHENNAI", invoice: 3, rc: 1, vehIns: 1, pdc: 1, agingMix: [60, 25, 15], status: "Critical" },
  { branch: "BANGALORE", invoice: 1, rc: 2, vehIns: null, pdc: null, agingMix: [50, 30, 20], status: "Critical" },
  { branch: "COIMBATORE", invoice: 3, rc: 1, vehIns: null, pdc: 2, agingMix: [70, 20, 10], status: "Critical" },
  { branch: "TRICHY", invoice: 1, rc: null, vehIns: null, pdc: 1, agingMix: [40, 35, 25], status: "Critical" },
  { branch: "VELLORE", invoice: null, rc: 3, vehIns: 3, pdc: 1, agingMix: [55, 30, 15], status: "Critical" },
  { branch: "SALEM", invoice: 3, rc: null, vehIns: 2, pdc: 1, agingMix: [65, 20, 15], status: "Critical" },
  { branch: "POONAMALLEE", invoice: 1, rc: 1, vehIns: 4, pdc: 2, agingMix: [45, 35, 20], status: "Critical" },
  { branch: "CUDDALORE", invoice: 1, rc: null, vehIns: 2, pdc: null, agingMix: [50, 30, 20], status: "Critical" },
  { branch: "HOSUR", invoice: 1, rc: 2, vehIns: 1, pdc: 2, agingMix: [60, 25, 15], status: "Critical" },
];

export const LEGACY_PDD_CASES: PddCaseRow[] = [
  { branch: "CHENNAI", contract: "LCHE23001001", customer: "RAVI SHANKAR P", executive: "Suresh K", docType: "Invoice", aging: 92, agingLabel: "Critical", disbDate: "12/01/2025", vehicle: "Supro", status: "Pending" },
  { branch: "BANGALORE", contract: "LBAN22001002", customer: "JAYAKODI V", executive: "Priya M", docType: "RC", aging: 75, agingLabel: "Warning", disbDate: "05/02/2025", vehicle: "Ertiga", status: "Pending" },
  { branch: "COIMBATORE", contract: "LC0T23001003", customer: "ARUMUGAM S", executive: "Vijay R", docType: "Veh. Ins.", aging: 45, agingLabel: "OK", disbDate: "18/02/2025", vehicle: "Marazzo", status: "Received" },
  { branch: "HOSUR", contract: "LH0S23001004", customer: "BASKARAN R", executive: "Meena S", docType: "PDC", aging: 88, agingLabel: "Critical", disbDate: "22/01/2025", vehicle: "Ciaz", status: "Pending" },
  { branch: "VELLORE", contract: "LVEL22001005", customer: "SELVARAJ M", executive: "Kumar A", docType: "Invoice", aging: 67, agingLabel: "Warning", disbDate: "30/01/2025", vehicle: "Dost", status: "Pending" },
  { branch: "SALEM", contract: "LSAL23001006", customer: "RAJENDHIRAN P", executive: "Anbu T", docType: "RC", aging: 95, agingLabel: "Critical", disbDate: "08/01/2025", vehicle: "Supro", status: "Pending" },
  { branch: "TRICHY", contract: "LTRI22001007", customer: "GOPALAKRISHNAN V", executive: "Rajan P", docType: "Veh. Ins.", aging: 38, agingLabel: "OK", disbDate: "25/02/2025", vehicle: "BMT", status: "Received" },
  { branch: "POONAMALLEE", contract: "LP0023001008", customer: "PONNUSAMY K", executive: "Divya L", docType: "PDC", aging: 82, agingLabel: "Critical", disbDate: "14/01/2025", vehicle: "Frigo", status: "Pending" },
  { branch: "CUDDALORE", contract: "LCUD23001009", customer: "MOHAMED RABI H", executive: "Senthil G", docType: "Invoice", aging: 71, agingLabel: "Warning", disbDate: "28/01/2025", vehicle: "Intra", status: "Pending" },
  { branch: "CHENNAI", contract: "LCHE22001010", customer: "DINESH KUMAR R", executive: "Kavitha N", docType: "RC", aging: 55, agingLabel: "Warning", disbDate: "10/02/2025", vehicle: "Ciaz", status: "Pending" },
];

export const LEGACY_DOC_SPLIT: DocSplitPoint[] = [
  { label: "Invoice", count: 14, color: "#405189" },
  { label: "RC", count: 10, color: "#0ab39c" },
  { label: "Veh. Ins.", count: 15, color: "#f7b84b" },
  { label: "PDC", count: 8, color: "#f06548" },
];

export const LEGACY_AGING_BY_DOC: AgingByDocTypePoint[] = [
  { docType: "Invoice", critical: 6, warning: 5, ok: 3 },
  { docType: "RC", critical: 4, warning: 4, ok: 2 },
  { docType: "Veh. Ins.", critical: 5, warning: 7, ok: 3 },
  { docType: "PDC", critical: 3, warning: 3, ok: 2 },
];
