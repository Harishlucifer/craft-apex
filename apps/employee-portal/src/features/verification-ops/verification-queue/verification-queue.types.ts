// Legacy craft-frontend/src/pages/Verification/VerificationListNew.js
// GET /alpha/v1/verification/list -> { result: VerificationRow[] }

export interface VerificationRow {
  verification_id?: string | number;
  application_code?: string;
  verification_type?: string;
  verification_status?: string;
  name?: string;
  loan_amount?: number | string;
  updatedAt?: string;
  createdAt?: string;
}
