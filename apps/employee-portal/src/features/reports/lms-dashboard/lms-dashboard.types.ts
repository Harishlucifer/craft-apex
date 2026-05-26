// Legacy: craft-frontend/src/pages/Reports/LMS/LmsDashboard.js
//
// LEGACY IS MOCK-ONLY: the legacy component is a static "landing page" for
// LMS reports — KPIs, six category cards, and a Quick Actions row are all
// hard-coded as in-component arrays. No useEffect, no API calls, no
// endpoints in ApiEndPoint.js.
//
// Per the no-guessing rule we do NOT invent endpoints. Types mirror the
// verbatim shape of the legacy in-memory data.

export interface LmsStat {
  label: string;
  value: string;
  change: string;
  color: "primary" | "success" | "warning" | "danger";
}

export interface LmsReportLink {
  name: string;
  badge: string;
  badgeColor?: "info" | "danger";
  link?: string;
}

export interface LmsCategory {
  title: string;
  subtitle: string;
  icon: string;
  reports: LmsReportLink[];
}
