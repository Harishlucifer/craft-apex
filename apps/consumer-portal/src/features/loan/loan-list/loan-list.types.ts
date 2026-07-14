// TODO(endpoint): there is NO customer-scoped loan-account endpoint in alpha-api.
//
// What was checked (app/routes/v1.go):
//
//   1. `/alpha/v1/loan-account?page=N` — the endpoint this screen was specced
//      against. DOES NOT EXIST. The group is `loanRoute := v1.Group("/loan-account")`
//      (v1.go:653) and it has no bare `Get("/")` route.
//
//   2. `/alpha/v1/loan-account/list` (v1.go:654 → lmsController.List) — exists,
//      and is what the EMPLOYEE portal's active-accounts-list calls. Not usable here:
//        - it hangs off `v1`, which is `middlewares.OptionalAuth()` (v1.go:49),
//          not `RequireLoggedIn`;
//        - app/controllers/v1/lms/controller.go:52 builds its WHERE clause from
//          the `loan_account_no` / `mobile` / `npa_status` QUERY PARAMS only and
//          then calls `loanAccount.FindAll(conditions)`. There is no user/customer
//          predicate anywhere in the path.
//      => it returns EVERY loan account in the tenant.
//
//   3. `/alpha/v1/los/loan/list?page=N&size=N` (v1.go:639 → losController.LoanAccountList)
//      — exists, is paginated, and IS behind `RequireLoggedIn`. Still not usable:
//      app/controllers/v1/los/controller.go:3768 declares `var conditions []db.WhereCondition`
//      and never appends to it before `FindAllWithPagination(conditions, ...)`.
//      => it also returns EVERY loan account in the tenant.
//
// Contrast with applications, which ARE auto-scoped: app/services/db/application.go:113
// adds an `application_participant.user_id = <caller>` subquery for UserTypeCustomer.
// There is no equivalent for loan accounts — `app/services/db/` contains only
// application.go, collection.go, lender_apply.go, partner.go and verification.go.
// The LMS LoanAccount model has no customer/user FK either; the only borrower
// linkage is the denormalised `ContactNumber` string (app/models/lms/loan_account.go:75).
//
// Filtering client-side by the signed-in user's mobile (`?mobile=…`) would make the
// screen LOOK right while remaining a trivially-spoofable, non-authoritative filter
// over an endpoint that leaks every borrower's loan. So this screen deliberately
// fetches nothing and shows an honest "not available yet" state.
//
// To finish this screen the backend needs ONE of:
//   (a) customer scoping in `app/services/db/` for loan accounts — i.e. the
//       UserTypeCustomer participant-subquery treatment applied to LoanAccount; or
//   (b) a new authenticated, auto-scoped route (e.g. GET /alpha/v1/loan-account
//       returning only the caller's accounts, paginated).
//
// The row type below is modelled on what those endpoints already return
// (app/handler/lms/loan_account.go), so wiring this up later should be a
// one-file change in loan-list.api.ts.

export interface LoanAccountRow {
  /** json-bigint: stays a string end-to-end. */
  loan_account_id?: string;
  loan_account_no?: string;
  loan_type_name?: string;
  loan_type_code?: string;
  borrower_name?: string;
  loan_amount?: number | string;
  sanctioned_amount?: number | string;
  disbursed_amount?: number | string;
  outstanding_amount?: number | string;
  emi?: number | string;
  next_due_date?: string;
  disbursed_date?: string;
  status?: number | string;
  npa_status?: string;
}
