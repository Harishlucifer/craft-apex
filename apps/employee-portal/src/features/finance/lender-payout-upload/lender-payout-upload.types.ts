// Legacy: craft-frontend/src/pages/PayableReceivableMgmt/Lender/UploadPayoutPlan.js
// (mounted at /finance/lender-payout-upload via allRoutes.js -> PayoutPlanUpload -> UploadPayoutPlan)
//
// Endpoints (verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js):
//   GET  /alpha/v1/finance/payout-dump                       (GET_PAYOUT_DUMP_LIST)
//        optional query: ?lender_id=&loan_type_id=&month=    (when filter form submits)
//        Response: { data: { data: PayoutDumpRow[] } }       (legacy reads res?.data?.data)
//   POST /alpha/v1/finance/payout-dump/upload                (UPLOAD_PAYOUT_DUMP)
//        multipart/form-data fields (verbatim):
//          - lender_id
//          - template            (the File)
//          - loan_type_id
//          - month
//   GET  /alpha/v1/master/lender                             (LENDER_GET)
//        Response: { data: { result: LenderMasterRow[] } }
//   GET  /alpha/v1/master/lender/{lender_id}                 (GET_LENDER_LOAN_TYPE + id)
//        Response: { data: { result: { lender_loan_type: LenderLoanTypeRow[] } } }
//
// Row fields are taken verbatim from the legacy column accessors.

export interface PayoutDumpRow {
  id?: string | number;
  lender_name?: string;
  loan_type?: string;
  file_name?: string;
  month?: string;
  created_at?: string;
  invoice_status?: number;
  status?: number;
}

export interface LenderMasterRow {
  lender_id: string | number;
  name: string;
}

export interface LenderLoanTypeRow {
  loan_type_id: string | number;
  loan_type_name: string;
  status?: number;
}

export interface PayoutDumpFilter {
  lender_id?: string;
  loan_type_id?: string;
  month?: string;
}

export interface UploadPayoutDumpInput {
  // Field names mirror the multipart contract verbatim.
  lender_id: string;
  loan_type_id: string;
  month: string;
  template: File;
}
