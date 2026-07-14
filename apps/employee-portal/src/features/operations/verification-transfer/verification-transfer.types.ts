// Exact shapes from legacy craft-frontend/src/pages/Verification/VerificationTransfer.js.
// Five endpoints — see *.api.ts for URLs.

import type { FormDefinition } from "@craft-apex/workflow-runtime";

export type Id = string | number;

// GET /alpha/v1/master/field-master?code=VERIFICATION_TRANSFER
// Response shape: body.data[0].data[0] is the field master with `form_builder`.
export interface FieldMasterFormConfig {
  form_builder?: FormDefinition;
  [key: string]: unknown;
}

export interface FieldMasterEnvelope {
  data: Array<{ data: FieldMasterFormConfig[] | null }> | null;
}

// GET /alpha/v1/user/info -> body.data
export interface UserInfo {
  user_type?: "EMPLOYEE" | "CHANNEL" | string;
  user_role_code?: string;
  partner_category?: string;
}

export interface VerificationPerson {
  user_name?: string;
  territory_name?: string;
}

export interface VerificationRow {
  verification_id: Id;
  verification_code?: string;
  verification_type?: string;
  verification_status?: string;
  loan_code?: string;
  external_lead_id?: string;
  name?: string;
  assigned_to?: VerificationPerson | null;
  submitted_to?: VerificationPerson | null;
  created_at?: string;
}

// GET /alpha/v1/verification/list?download=true&...  -> body
// Legacy reads `response.result` (top-level) for the rows.
export interface VerificationListEnvelope {
  result: VerificationRow[] | null;
}

// POST /alpha/v1/verification/transfer
export interface VerificationTransferPayload {
  from_user_id: string;
  to_user_id: string;
  from_territory_id: string;
  to_territory_id: string;
  verification_id: Id[];
  remarks: string;
  /** Legacy: true when filterObj.current_to_role === "BRANCH_OFFICER". */
  processor_only: boolean;
}

export interface VerificationTransferResponse {
  status?: boolean | number;
  data?: unknown;
}

// POST /alpha/v1/verification/export?<filter>
export interface VerificationExportResponse {
  status?: number;
  message?: string;
  download_url?: string;
}

// Legacy filterObj fields used in `handleSubmitTransfer` (from craft-formbuilder
// state). All optional because the form schema drives which exist.
export interface FilterValues {
  from_employee_id?: string;
  to_employee_id?: string;
  territory_id?: string | number;
  to_territory_id?: string | number;
  self?: string | boolean;
  current_to_role?: string;
  // Plus any other fields the field-master form contributes.
  [key: string]: unknown;
}

// Legacy constant.ModuleNames.userVerificationTransfer.
export const VERIFICATION_TRANSFER_CODE = "VERIFICATION_TRANSFER";
