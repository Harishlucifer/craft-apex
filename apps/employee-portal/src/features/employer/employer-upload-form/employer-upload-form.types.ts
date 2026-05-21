// Legacy craft-frontend/src/pages/Configuration/EmployerMgmt/AddUpload.js
// POST /alpha/v1/employer/lender/upload   (multipart: lender_id, loan_type, document)
// Lender list:      GET /alpha/v1/master/lender                  -> data.result
// Lender loan types: GET /alpha/v1/master/lender/{id}            -> data.result.lender_loan_type (status===1)

export interface LenderOption {
  lender_id: string | number;
  name: string;
}

export interface LenderLoanTypeRow {
  loan_type_id: string | number;
  loan_type_name: string;
  status: number;
}
