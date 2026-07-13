import type { LoanAccountRow } from "./loan-list.types";

// TODO(endpoint): no customer-scoped loan-account endpoint exists in alpha-api.
// The full audit (three candidate routes, why each is unusable, and what the
// backend needs to add) is written up at the top of ./loan-list.types.ts.
//
// Summary: `/alpha/v1/loan-account?page=N` does not exist;
// `/alpha/v1/loan-account/list` and `/alpha/v1/los/loan/list` both exist but
// neither filters by the caller, so both return every borrower's loan accounts.
// Wiring either into a borrower-facing portal would expose other customers'
// loans, so this hook intentionally performs NO request and reports an
// unavailable state instead.
//
// When the backend ships a scoped route, this is the only file that must change:
// restore a `useQuery` here returning `LoanAccountRow[]` and the page will render
// it as-is.

export interface LoanListResult {
  rows: LoanAccountRow[];
  /** True while no customer-scoped endpoint exists to call. */
  unavailable: boolean;
}

export function useLoanList(): LoanListResult {
  return { rows: [], unavailable: true };
}
