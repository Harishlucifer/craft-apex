// Pincode Eligibility — legacy channel-flexi/src/Components/UserUtility/PincodeEligibility/index.js
// Endpoints:
//   GET  /alpha/v1/master/loan-type                       (LOAN_TYPE_MASTER)
//   POST /alpha/v1/utility/lender-eligible/pincode        (ELIGIBLE_LENDERS)
//        { address_type: [{ type, pincode }], loan_type_id }
//        -> { result: { eligible_lenders, non_eligible_lenders } }
//   (alpha-api app/routes/v1.go:605 → utilityController.LenderEligible)

export interface LoanTypeOption {
  /** json-bigint: ids stay strings */
  id: string;
  code?: string;
  name: string;
}

export interface AddressEntry {
  /** CURRENT_RESIDENCE | BUSINESS_ADDRESS */
  type: string;
  pincode: string;
}

export interface EligibilityRequest {
  address_type: AddressEntry[];
  loan_type_id: string;
}

export interface LenderResult {
  id?: string;
  name?: string;
  code?: string;
  logo?: string;
  reason?: string;
}

export interface EligibilityResult {
  eligible_lenders: LenderResult[];
  non_eligible_lenders: LenderResult[];
}
