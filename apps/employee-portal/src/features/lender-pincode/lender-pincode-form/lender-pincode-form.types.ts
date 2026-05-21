// Legacy craft-frontend/src/pages/Configuration/LenderOnboarding/LenderPincode/AddLenderPincode.js
// POST /alpha/v1/master/lender/pincode  (multipart: lender_id, lender_template_type, template, loan_type_id)
// Lender list:  GET /alpha/v1/master/lender                  -> data.result
// Lender loan types: GET /alpha/v1/master/lender/{id}        -> data.result.lender_loan_type (status===1)
// Configuration:  GET /alpha/v1/lookup?group_code=LENDER_PINCODE_OPTION
// Template link:  GET /alpha/v1/migration/download/{template_type} -> data.result.link

export interface LenderOption {
  lender_id: string | number;
  name: string;
}

export interface LenderLoanTypeRow {
  loan_type_id: string | number;
  loan_type_name: string;
  status: number;
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
}

export interface TemplateLinkResult {
  link: string;
}
