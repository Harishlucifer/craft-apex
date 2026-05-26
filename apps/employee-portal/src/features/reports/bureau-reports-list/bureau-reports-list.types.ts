// Bureau Reports List — legacy
// /Components/Reports/RegulatoryReporting/BureauReporting/BureauReporsListView.js
//
// MOCK-ONLY in legacy: the list page hardcodes `bureauData` (3 rows) and renders
// the `TableContainerReactTable`. There is no GET endpoint backing this page
// (verified against ApiEndPoint.js — only BUREAU_PULL_LIST, BUREAU_INIT,
// BUREAU_APPLICANT_UPDATE, REPORT_BUREAU_ANALYZER exist, none are this list).
//
// We mirror the legacy mock verbatim so the port stays faithful until a real
// endpoint exists.

export interface BureauSubmissions {
  cibil: boolean;
  experian: boolean;
  equifax: boolean;
  crif: boolean;
}

export interface BureauReportRow {
  id: number;
  period: string;
  periodSub: string;
  generatedOn: string;
  generatedTime: string;
  accounts: string;
  submissions: BureauSubmissions;
}

/** Verbatim from legacy BureauReporsListView.js lines 14-57. */
export const BUREAU_REPORTS_MOCK: BureauReportRow[] = [
  {
    id: 1,
    period: "Nov 2025",
    periodSub: "01-Nov to 30-Nov",
    generatedOn: "01-Dec-2025",
    generatedTime: "14:30 IST",
    accounts: "15,847",
    submissions: { cibil: true, experian: true, equifax: true, crif: true },
  },
  {
    id: 2,
    period: "Oct 2025",
    periodSub: "01-Oct to 31-Oct",
    generatedOn: "02-Nov-2025",
    generatedTime: "16:45 IST",
    accounts: "14,523",
    submissions: { cibil: true, experian: true, equifax: true, crif: true },
  },
  {
    id: 3,
    period: "Sep 2025",
    periodSub: "01-Sep to 30-Sep",
    generatedOn: "01-Oct-2025",
    generatedTime: "10:15 IST",
    accounts: "13,982",
    submissions: { cibil: true, experian: true, equifax: false, crif: true },
  },
];
