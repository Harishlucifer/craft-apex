// Legacy craft-frontend/src/pages/Configuration/EmployerMgmt/UploadList.js
// GET /alpha/v1/employer/lender/upload -> { data: EmployerUploadRow[] }

export interface EmployerUploadRow {
  upload_id?: string | number;
  lender_name?: string;
  loan_type?: string;
  file_name?: string;
  process_status?: string;
}
