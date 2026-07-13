// GET /alpha/v1/application/{applicationId}
//   -> { status, application_id, result: LoanApplication, message }
//
// Backend: app/routes/v1.go:196 `applicationRoute.Get("/:applicationId", losController.Fetch)`.
// Note the envelope key is `result`, NOT `data` (app/controllers/v1/los/controller.go:212)
// — the standard defensive unwrap (`data ?? result ?? body`) covers this.
//
// Shape: app/handler/los/loan_application.go `LoanApplication` (line 136), whose
// `application` field is the `Application` struct (line 11).
//
// Every field is optional on purpose. This response is a large nested object
// assembled per loan product; a borrower-facing screen must render what exists
// and omit the rest rather than blow up on a missing branch.

import type { ActiveTask } from "../application-list/application-list.types";

/** app/handler/los/loan_application.go:11 — `result.application` */
export interface ApplicationCore {
  application_id?: string;
  application_code?: string;
  loan_type_code?: string;
  loan_type_name?: string;
  type?: string;
  loan_amount?: string | number;
  loan_code?: string;
  loan_status?: string;
  status?: number;
  status_string?: string;
  purpose_of_loan?: string;
  applicant_name?: string;
  contact_name?: string;
  salutation?: string;
  mobile?: string;
  email?: string;
  employment_type?: string;
  entity_type?: string;
  apply_capacity?: string;
  submission_mode?: string;
  created_timestamp?: string;
  updated_timestamp?: string;
}

/** app/handler/onboarding/onboarding.go:206 */
export interface ApplicantPerson {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  mobile?: string;
  email?: string;
  dob?: string;
  gender?: string;
}

export interface ApplicantBusiness {
  business_name?: string;
  name?: string;
  entity_type?: string;
}

export interface Applicant {
  applicant_id?: string;
  applicant_type?: string;
  applicant_category?: string;
  applicant_name?: string;
  personal?: ApplicantPerson | null;
  business?: ApplicantBusiness | null;
}

/**
 * `result` — LoanApplication. The detail payload does not itself carry an
 * `active_task`, but sibling application payloads do, so we accept it
 * defensively at both levels and render whichever turns up.
 */
export interface ApplicationDetail {
  application?: ApplicationCore;
  applicants?: Applicant[];
  active_task?: ActiveTask | null;
  application_active_task?: ActiveTask | null;
  customer_link?: string;
}

export type { ActiveTask };
