// Legacy: craft-frontend/src/pages/Configuration/Employee/EmployeeAddress.js
//
// Step 2 of the employee create/edit wizard. Persists a single user_address
// row associated with the employee. The legacy file calls handleNext(address)
// and lets step-1's bundle POST persist; here we POST /alpha/v1/employee with
// { employee_id, user_address } so the step is self-contained.
//
// Endpoints (verbatim from legacy + ApiEndPoint.js):
//   GET  /alpha/v1/employee/{id}                            -> { result: { user_address: {...} } }
//   GET  /alpha/v1/master/pin-code?pincode={pincode}        -> { data: [PincodeRow] }
//   POST /alpha/v1/utility/formatted-address                 -> { result: <address-string> }
//   POST /alpha/v1/employee                                  -> save bundle

export interface UserAddress {
  user_address_id?: string | number;
  address_type: string; // 'HOME' | 'OTHER'
  address?: string;
  latitude: number;
  longitude: number;
  area_id: number;
  city_id: number;
  state_id: number;
  country_id: number;
  pincode: string;
  status: number;
}

export interface PincodeRow {
  id: string | number;
  area: string;
  cityId?: string | number;
  stateId?: string | number;
  countryId?: string | number;
  coreCityList?: { name: string };
  coreStateList?: { name: string };
  coreCountryList?: { name: string };
}

export interface AddressOption {
  value: string | number;
  label: string;
  id: string | number;
}

export interface FormattedAddressPayload {
  latitude: string;
  longitude: string;
}

export interface EmployeeAddressSavePayload {
  employee_id: string | number;
  // Backend validates the full EmployeeParams struct on every save (create
  // and update share one endpoint/validator) — mobile/email/name/status are
  // unconditionally required, and user_id is required once employee_id is
  // set. Must be carried forward from the employee's own detail record or
  // this call 400s even though we're only touching the address.
  user_id?: string | number;
  mobile: string;
  email: string;
  name: string;
  status: number;
  user_address: UserAddress;
}
