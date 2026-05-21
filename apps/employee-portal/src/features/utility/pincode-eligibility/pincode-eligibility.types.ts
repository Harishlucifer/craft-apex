// Pincode Eligibility — legacy /Components/UserUtility/PincodeEligibility/index.js
// Endpoints:
//   GET  /alpha/v1/master/loan-type
//   POST /alpha/v1/utility/lender-eligible/pincode
//        { address_type: [{type, pincode}], loan_type_id }
//        -> { result: { eligible_lenders, non_eligible_lenders } }

export interface LoanTypeOption {
  id: string | number;
  code?: string;
  name: string;
}

export interface AddressEntry {
  type: string;
  pincode: string;
}

export interface EligibilityRequest {
  address_type: AddressEntry[];
  loan_type_id: string;
}

export interface LenderResult {
  id?: string | number;
  name?: string;
  code?: string;
  logo?: string;
  reason?: string;
}

export interface EligibilityResult {
  eligible_lenders: LenderResult[];
  non_eligible_lenders: LenderResult[];
}
