// Legacy: craft-frontend/src/pages/Reports/BusinsessAndOrgination/BusinessDashboard.js
//
// LEGACY IS MOCK-ONLY — no API calls exist in the source. The legacy file
// hard-codes KPIs, branch performance, monthly-vs-target & FY-trend chart
// series, and the deal-register table as in-component arrays. Filter
// dropdowns are literal <option> tags with no state.
//
// Per the no-guessing rule we do NOT fabricate URLs or response shapes.
// This module exports only the verbatim mock data from legacy.

import type {
  BranchPerformance,
  BusinessKpi,
  DealRow,
  FyTrendPoint,
  MonthlyTargetPoint,
} from "./business-dashboard.types";

export const LEGACY_BUSINESS_KPIS: BusinessKpi[] = [
  { label: "Total Disbursed", value: "₹430Cr", sub: "Sep 2025 · 952 loans" },
  { label: "Target Achievement", value: "87.6%", sub: "↑ 4.2% vs Aug" },
  { label: "Sep Target", value: "₹491Cr", sub: "Revised target" },
  { label: "Avg. Net IRR", value: "17.8%", sub: "Weighted across branches" },
  { label: "Approval Rate", value: "82.4%", sub: "119 of 144 logins" },
  { label: "Deal Lost", value: "4", sub: "₹38.2L post-approval" },
];

export const LEGACY_BRANCH_PERFORMANCE: BranchPerformance[] = [
  { branch: "BANGALORE", target: "49L", disbursed: "75L", files: 17, achvmt: "153%", tone: "good" },
  { branch: "CHENNAI", target: "49L", disbursed: "52L", files: 22, achvmt: "106%", tone: "good" },
  { branch: "POONAMALLEE", target: "66L", disbursed: "76L", files: 21, achvmt: "115%", tone: "good" },
  { branch: "COIMBATORE", target: "48L", disbursed: "80L", files: 12, achvmt: "167%", tone: "good" },
  { branch: "TRICHY", target: "62L", disbursed: "66L", files: 23, achvmt: "106%", tone: "good" },
  { branch: "VELLORE", target: "79L", disbursed: "80L", files: 17, achvmt: "101%", tone: "good" },
  { branch: "SALEM", target: "73L", disbursed: "50L", files: 23, achvmt: "68%", tone: "warn" },
];

export const LEGACY_MONTHLY_TARGET: MonthlyTargetPoint[] = [
  { month: "Apr", target: 300, actual: 250 },
  { month: "May", target: 400, actual: 380 },
  { month: "Jun", target: 500, actual: 500 },
  { month: "Jul", target: 450, actual: 420 },
  { month: "Aug", target: 480, actual: 460 },
  { month: "Sep", target: 491, actual: 430 },
];

export const LEGACY_FY_TREND: FyTrendPoint[] = [
  { month: "Apr", prev: 350, current: 420 },
  { month: "May", prev: 420, current: 410 },
  { month: "Jun", prev: 410, current: 500 },
  { month: "Jul", prev: 380, current: 450 },
  { month: "Aug", prev: 440, current: 380 },
  { month: "Sep", prev: 400, current: 430 },
];

export const LEGACY_DEAL_REGISTER: DealRow[] = [
  { id: "31", branch: "TRICHY", contractNo: "PTRI25090031", customer: "JAYAKODI V", executive: "Senthil K", vehicle: "Intra", financeType: "New", amount: "₹5,81,596", irr: "17.6%", status: "Approved", date: "1 Sep 2025" },
  { id: "32", branch: "CUDDALORE", contractNo: "PCUD25090032", customer: "RANI K", executive: "Senthilkumar K", vehicle: "Bolero", financeType: "Used", amount: "₹3,83,868", irr: "17.4%", status: "Disbursed", date: "29 Sep 2025" },
  { id: "33", branch: "CHENNAI", contractNo: "PCHE25090033", customer: "MURUGALAKSHMI M", executive: "Chokalingam A", vehicle: "Ciaz", financeType: "New", amount: "₹4,62,638", irr: "16.0%", status: "Disbursed", date: "24 Sep 2025" },
  { id: "34", branch: "BANGALORE", contractNo: "PBAN25090034", customer: "GOPALAKRISHNAN V", executive: "Irfan Ulla Khan", vehicle: "Dost", financeType: "Takeover", amount: "₹7,07,805", irr: "18.8%", status: "Disbursed", date: "2 Sep 2025" },
  { id: "35", branch: "SALEM", contractNo: "PSAL25090035", customer: "MOHAMED RABI H", executive: "Meena R", vehicle: "Ciaz", financeType: "Takeover", amount: "₹4,11,977", irr: "18.6%", status: "Deal Lost", date: "12 Sep 2025" },
  { id: "36", branch: "HOSUR", contractNo: "PHOS25090036", customer: "PONNUSAMY K", executive: "Anadhan G", vehicle: "Intra", financeType: "Refinance", amount: "₹4,75,692", irr: "21.7%", status: "Disbursed", date: "24 Sep 2025" },
  { id: "37", branch: "COIMBATORE", contractNo: "PCOI25090037", customer: "SELVARAJ M", executive: "Priya K", vehicle: "Ace", financeType: "Takeover", amount: "₹4,43,650", irr: "21.4%", status: "Rejected", date: "19 Sep 2025" },
  { id: "38", branch: "VELLORE", contractNo: "PVEL25090038", customer: "KRISHNAMOORTHY V", executive: "Bala M", vehicle: "Ace", financeType: "Takeover", amount: "₹5,20,182", irr: "17.3%", status: "In Process", date: "26 Sep 2025" },
  { id: "39", branch: "HOSUR", contractNo: "PHOS25090039", customer: "GOPALAKRISHNAN V", executive: "Anadhan G", vehicle: "Dzire", financeType: "Refinance", amount: "₹4,46,586", irr: "21.9%", status: "Rejected", date: "23 Sep 2025" },
  { id: "40", branch: "COIMBATORE", contractNo: "PCOI25090040", customer: "PONNUSAMY K", executive: "Mohankumar S", vehicle: "Tata 407", financeType: "Takeover", amount: "₹2,39,797", irr: "16.2%", status: "Approved", date: "7 Sep 2025" },
];
