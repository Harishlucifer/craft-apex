// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/LenderPincode/List.js
// GET /alpha/v1/master/lender/pincode/uploads -> { data: LenderPincodeUploadRow[] }

export interface LenderPincodeUploadRow {
  pincode_upload_id?: string | number;
  lender_name?: string;
  loan_type?: string;
  configuration_type?: string;
  file_link?: string;
  eligible_pincode_count?: number;
}
