// Legacy craft-frontend/src/pages/Verification/VerificationType/VerificationTypeList.js
// GET /alpha/v1/verification/category/list -> { data: VerificationTypeRow[] }

export interface VerificationTypeRow {
  category_id?: string | number;
  verification_type?: string;
  employment_type?: string;
  status?: number;
}
