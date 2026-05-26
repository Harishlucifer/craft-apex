// Step 3 of the Employee create/edit stepper — "Territory Loan-type Mapping".
// Ported from craft-frontend/src/pages/Configuration/Employee/EmployeeLocation.js.
//
// Master endpoints (read verbatim from legacy):
//   GET /alpha/v1/master/territory-type            -> { data: TerritoryTypeRow[] }
//   GET /alpha/v1/master/loan-type                 -> { data: LoanTypeRow[] }
//   GET /alpha/v1/master/territory                 -> { data: TerritoryRow[] }
//   GET /alpha/v1/master/lender?loan_type_id=...   -> { result: LenderRow[] }
//   GET /alpha/v1/employee/:id                     -> { result: { territory_loan_map: TerritoryLoanMapEntry[] } }
//
// Save endpoint (mirrors legacy index.js activeStep===2 branch):
//   POST /alpha/v1/employee  with the full bundle including `territory_loan_map`.

export interface TerritoryTypeRow {
  territory_type_id: string | number;
  territory_type_name: string;
}

export interface TerritoryRow {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}

export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LenderRow {
  lender_id: string | number;
  name: string;
}

export interface TerritoryLoanMapEntry {
  all_lender_enabled: boolean;
  territory_type_name: string;
  territory_type_id: string | number;
  territory_name: string;
  territory_id: string | number;
  status: number;
  loan_type_ids: string[];
  loan_types: { loan_type_id?: string | number; loan_type_name: string }[];
  lenders: { lender_id?: string | number; lender_name: string }[];
  lender_ids: (string | number)[];
}
