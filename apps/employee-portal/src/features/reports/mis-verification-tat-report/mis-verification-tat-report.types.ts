// Exact shapes from legacy craft-frontend/src/pages/MIS/VerificationTATReport.js.
//
// Four endpoints power the lookups; the row table reads from a fifth. Note:
// the legacy filter UI is INERT — it never sends params to the verification
// list endpoint (`getVerifications()` is called once on mount, no args).
// Dashboard cards (5x) and TAT column values in legacy are hard-coded literals
// (54/57/4/5/5 and 11h/1h/2h/14h) with no API contract — both omitted here
// until the backend exposes them.

export type Id = string | number;

// GET /alpha/v1/verification/category/list -> body.data[]
export interface VerificationCategoryRow {
  verification_type: string;
}

// GET /alpha/v1/master/loan-type -> body.data[]
export interface LoanTypeRow {
  id: Id;
  name: string;
}

// GET /alpha/v1/user/least/territory -> body.data[]
export interface TerritoryRow {
  id: Id;
  name: string;
}

// GET /alpha/v1/verification/list -> body.result[]
export interface VerificationPerson {
  user_name?: string;
  territory_name?: string;
}

export interface VerificationRow {
  verification_code?: string;
  verification_type?: string;
  verification_status?: string;
  loan_amount?: number | string;
  name?: string;
  created_by?: VerificationPerson | null;
  assigned_to?: VerificationPerson | null;
  submitted_to?: VerificationPerson | null;
}

export interface ApiDataResponse<T> {
  data: T[] | null;
}

export interface ApiResultResponse<T> {
  result: T[] | null;
}

// Verbatim map from legacy `typeVerificationMap` — used to humanize
// `verification_type` codes for display.
export const VERIFICATION_TYPE_LABEL: Record<string, string> = {
  PSIR_VERIFICATION: "PSIR Verification",
  RESIDENCE_VERIFICATION_SALARIED: "PSVR Residence",
  PROPERTY_VERIFICATION: "PSVR Property",
  BUSINESS_VERIFICATION_SELF_EMPLOYED: "PSVR Self Employed",
  EMPLOYMENT_VERIFICATION_SALARIED: "PSVR Salaried",
};

export function verificationLabel(code?: string): string {
  if (!code) return "-";
  return VERIFICATION_TYPE_LABEL[code.trim()] ?? code;
}
