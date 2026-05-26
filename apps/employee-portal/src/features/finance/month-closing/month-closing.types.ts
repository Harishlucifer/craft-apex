// Legacy: craft-frontend/src/Components/Accounting/MonthClosing.js
//
// LEGACY IS MOCK-ONLY: the legacy component holds all state locally with
// useState — there are no API calls, no endpoints, no real backend wiring.
// Period / Entity / Closing Date are hard-coded option lists, and the
// checklist categories/items are an in-memory array. No fields in
// ApiEndPoint.js back this screen.
//
// Per the no-guessing rule we do NOT invent endpoints. The types below
// mirror the verbatim shape of the legacy in-memory data so the page can
// be wired up once a real API exists.

export interface MonthClosingChecklistItem {
  id: number;
  label: string;
  checked: boolean;
  isDue?: boolean;
}

export interface MonthClosingChecklistCategory {
  category: string;
  items: MonthClosingChecklistItem[];
}

export interface MonthClosingStats {
  total: number;
  completed: number;
  pending: number;
  progress: number;
}

export interface MonthClosingFilters {
  selectedPeriod: string;
  selectedEntity: string;
  closingDate: string;
}
