// Legacy: craft-frontend/src/Components/Accounting/MonthClosing.js
//
// LEGACY IS MOCK-ONLY — no API calls exist in the source. The legacy file
// uses local useState for period / entity / closing date / checklist, and
// the "Close Month End" button has no onClick handler wired to a request.
//
// Per the no-guessing rule we do NOT fabricate URLs, query params, request
// bodies, or response shapes. This module exports only the verbatim mock
// data shipped in the legacy file so the placeholder page renders the
// exact same checklist categories the user saw before.
//
// TODO(month-closing): once backend endpoints exist, wrap api.get / api.post
// in React Query here (see gst-status-list.api.ts for the pattern).

import type {
  MonthClosingChecklistCategory,
  MonthClosingStats,
} from "./month-closing.types";

export const LEGACY_PERIOD_OPTIONS = [
  "March 2025",
  "February 2025",
  "January 2025",
];

export const LEGACY_ENTITY_OPTIONS = [
  "ABC NBFC Limited",
  "XYZ NBFC Limited",
];

// Verbatim from MonthClosing.js useState seed.
export const LEGACY_CHECKLIST: MonthClosingChecklistCategory[] = [
  {
    category: "Bank Reconciliation",
    items: [
      { id: 1, label: "All Bank Accounts Reconciled", checked: true },
      { id: 2, label: "Outstanding Checks Verified", checked: true },
    ],
  },
  {
    category: "Loan Portfolio",
    items: [
      { id: 3, label: "Interest Accrued on All Loans", checked: true },
      { id: 4, label: "NPA Classification Updated", checked: true },
      { id: 5, label: "Provision for Bad Debts Calculated", checked: false },
    ],
  },
  {
    category: "Financial Statements",
    items: [
      { id: 6, label: "Trial Balance Generated & Balanced", checked: true },
      { id: 7, label: "P&L Statement Prepared", checked: false },
      { id: 8, label: "Balance Sheet Prepared", checked: false },
      { id: 9, label: "Depreciation Posted", checked: true },
    ],
  },
  {
    category: "Compliance & Returns",
    items: [
      { id: 10, label: "GST Returns Filed", checked: true },
      {
        id: 11,
        label: "RBI Returns Submitted (NBS-7, ALM)",
        checked: false,
        isDue: true,
      },
    ],
  },
];

export function computeStats(
  checklist: MonthClosingChecklistCategory[],
): MonthClosingStats {
  let total = 0;
  let completed = 0;
  checklist.forEach((cat) => {
    cat.items.forEach((item) => {
      total++;
      if (item.checked) completed++;
    });
  });
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, pending, progress };
}
