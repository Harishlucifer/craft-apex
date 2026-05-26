// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/PortfolioParameters.js
//
// LEGACY IS MOCK-ONLY — no API calls exist in the source. The legacy file
// hard-codes KPI cards, the LTV bucket bar chart series, the IRR-by-product
// table, and the branch target/ATS table as in-component arrays.
//
// Per the no-guessing rule we do NOT fabricate URLs or response shapes.
// This module exports only the verbatim mock data from legacy.

import type {
  BranchTargetRow,
  IrrByProductRow,
  LtvBucketPoint,
  PortfolioKpi,
} from "./portfolio-parameters.types";

export const LEGACY_PORTFOLIO_KPIS: PortfolioKpi[] = [
  { label: "Avg. LTV (New)", value: "78.4%", sub: "below 80% limit", color: "primary" },
  { label: "Avg. Gross IRR", value: "19.2%", sub: "weighted avg all products", color: "success" },
  { label: "Avg. Net IRR", value: "17.8%", sub: "post-payout", color: "info" },
  { label: "≤70% LTV", value: "42.3%", sub: "of portfolio (target 35%)", color: "warning" },
  { label: ">85% LTV", value: "8.1%", sub: "↑ 1.2% — monitor", color: "danger" },
];

export const LEGACY_LTV_BUCKETS: LtvBucketPoint[] = [
  { bucket: "<70%", pct: 42.3 },
  { bucket: "71-80%", pct: 31.2 },
  { bucket: "81-85%", pct: 18.4 },
  { bucket: ">85%", pct: 8.1 },
];

export const LEGACY_LTV_BUCKET_COLORS = ["#34c38f", "#556ee6", "#f1b44c", "#f46a6a"];

export const LEGACY_IRR_BY_PRODUCT: IrrByProductRow[] = [
  { product: "BUS", new: "19.4%", refinance: "17.2%", used: "16.8%", takeover: "15.9%", avgLtv: "74.2%" },
  { product: "CAR", new: "18.8%", refinance: "16.6%", used: "17.1%", takeover: "17.4%", avgLtv: "73.9%" },
  { product: "HCV", new: "—", refinance: "18.9%", used: "15.4%", takeover: "—", avgLtv: "64.2%" },
  { product: "ICV", new: "17.4%", refinance: "18.1%", used: "16.9%", takeover: "17.8%", avgLtv: "70.2%" },
  { product: "LCV", new: "18.2%", refinance: "17.6%", used: "17.3%", takeover: "17.9%", avgLtv: "73.8%" },
  { product: "SCV", new: "19.1%", refinance: "18.4%", used: "17.8%", takeover: "18.1%", avgLtv: "75.2%" },
];

export const LEGACY_BRANCH_TARGETS: BranchTargetRow[] = [
  { branch: "BANGALORE", target: "80L", ats: "5.2L", actual: "68.2L", ytdTarget: "430L", ytdActual: "368L", achievement: "86%" },
  { branch: "CHENNAI", target: "60L", ats: "4.8L", actual: "52.1L", ytdTarget: "310L", ytdActual: "271L", achievement: "87%" },
  { branch: "POONAMALLEE", target: "55L", ats: "5L", actual: "48.4L", ytdTarget: "290L", ytdActual: "260L", achievement: "90%" },
  { branch: "COIMBATORE", target: "50L", ats: "4.6L", actual: "43.2L", ytdTarget: "265L", ytdActual: "228L", achievement: "86%" },
  { branch: "TRICHY", target: "45L", ats: "5.1L", actual: "41.8L", ytdTarget: "240L", ytdActual: "209L", achievement: "87%" },
  { branch: "VELLORE", target: "40L", ats: "4.4L", actual: "38.6L", ytdTarget: "210L", ytdActual: "186L", achievement: "89%" },
  { branch: "SALEM", target: "35L", ats: "4.2L", actual: "32.1L", ytdTarget: "185L", ytdActual: "165L", achievement: "89%" },
];
