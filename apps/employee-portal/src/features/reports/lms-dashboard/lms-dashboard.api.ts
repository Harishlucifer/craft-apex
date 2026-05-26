// Legacy: craft-frontend/src/pages/Reports/LMS/LmsDashboard.js
//
// LEGACY IS MOCK-ONLY — no API calls exist in the source. The legacy file is
// a static "landing page" for LMS reports. Stats, category cards, and the
// Quick Actions row are all hard-coded as in-component arrays.
//
// Per the no-guessing rule we do NOT fabricate URLs or response shapes.
// This module exports only the verbatim mock data from the legacy file.

import type {
  LmsCategory,
  LmsStat,
} from "./lms-dashboard.types";

export const LEGACY_LMS_STATS: LmsStat[] = [
  { label: "Total Portfolio", value: "₹842.5 Cr", change: "↑ 12.3% from last month", color: "primary" },
  { label: "Active Loans", value: "12,458", change: "↑ 456 new this month", color: "success" },
  { label: "GNPA %", value: "2.8%", change: "↑ 0.3% from last month", color: "warning" },
  { label: "Collection Efficiency", value: "94.2%", change: "↑ 1.5% from last month", color: "success" },
];

export const LEGACY_LMS_CATEGORIES: LmsCategory[] = [
  {
    title: "Portfolio & Book",
    subtitle: "Size, composition & quality",
    icon: "book",
    reports: [
      { name: "Loan Outstanding Report", badge: "Daily", link: "/reports/lms/portfolio-overview" },
      { name: "Portfolio by Product/Branch", badge: "Daily" },
      { name: "Secured vs Unsecured", badge: "Weekly" },
      { name: "Concentration Risk Analysis", badge: "Monthly" },
      { name: "Portfolio Growth Trend", badge: "New", badgeColor: "info" },
      { name: "Vintage Analysis", badge: "Monthly" },
    ],
  },
  {
    title: "Repayment & Collections",
    subtitle: "Payment performance & efficiency",
    icon: "wallet",
    reports: [
      { name: "EMI Due vs Collected", badge: "Daily" },
      { name: "Collection Efficiency", badge: "Daily", link: "/reports/lms/collection-efficiency" },
      { name: "Bounce/Failed Payment Report", badge: "Alert", badgeColor: "danger" },
      { name: "Collector Performance", badge: "Daily" },
      { name: "Channel-wise Collection", badge: "Daily" },
      { name: "Pending EMI Aging", badge: "Daily" },
    ],
  },
  {
    title: "Delinquency & NPA",
    subtitle: "Risk monitoring & asset quality",
    icon: "alert",
    reports: [
      { name: "DPD Aging Report", badge: "Critical", badgeColor: "danger", link: "/reports/lms/dpd-aging" },
      { name: "SMA 0/1/2 Classification", badge: "Critical", badgeColor: "danger" },
      { name: "NPA Movement Report", badge: "Critical", badgeColor: "danger", link: "/reports/lms/npa-movement" },
      { name: "Roll Forward/Back Analysis", badge: "Weekly" },
      { name: "GNPA & NNPA Report", badge: "Monthly" },
      { name: "Cure Rate Analysis", badge: "Monthly" },
    ],
  },
  {
    title: "Income & Revenue",
    subtitle: "Earnings & yield analysis",
    icon: "trending",
    reports: [
      { name: "Interest Accrued vs Received", badge: "Daily", link: "/reports/lms/interest-accrual" },
      { name: "Penal Interest Report", badge: "Daily" },
      { name: "Fee Income Analysis", badge: "Monthly" },
      { name: "Suspended Interest (NPA)", badge: "Monthly" },
      { name: "Portfolio Yield (IRR)", badge: "Monthly" },
    ],
  },
  {
    title: "Accounting & Finance",
    subtitle: "GL, provisioning & reconciliation",
    icon: "briefcase",
    reports: [
      { name: "Loan Ledger Summary", badge: "Daily" },
      { name: "GL Posting Report", badge: "Daily" },
      { name: "Provisioning Report", badge: "Monthly" },
      { name: "Write-off vs Recovery", badge: "Monthly" },
      { name: "Interest Suspense Account", badge: "Monthly" },
    ],
  },
  {
    title: "Regulatory & Compliance",
    subtitle: "RBI & statutory reporting",
    icon: "shield",
    reports: [
      { name: "RBI NPA Statement", badge: "Monthly" },
      { name: "ALM Cashflow Report", badge: "Monthly" },
      { name: "Exposure Norms Compliance", badge: "Monthly" },
      { name: "Restructured Loan Register", badge: "Monthly" },
      { name: "Moratorium Impact Report", badge: "Quarterly" },
    ],
  },
];
