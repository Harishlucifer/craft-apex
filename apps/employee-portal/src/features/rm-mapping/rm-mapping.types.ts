export interface TerritoryTypeRow {
  territory_type_id: string;
  territory_type_name: string;
}

export interface TerritoryRow {
  territory_id: string;
  territory_name: string;
  territory_type_id: string;
}

export interface LoanTypeRow {
  id: string;
  name: string;
}

export interface LenderRow {
  lender_id: string;
  name: string;
}

export interface EmployeeRow {
  user_id: string;
  name: string;
  role_code: string;
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
  lu_value?: string;
}

export interface TerritoryLoanMapEntry {
  all_lender_enabled: boolean;
  territory_type_name: string;
  territory_type_id: string;
  territory_name: string;
  territory_id: string;
  sourcing_territory: string;
  status: number;
  loan_type_ids: string[];
  loan_types: { loan_type_id: string; loan_type_name: string }[];
  lenders?: { lender_id: string; lender_name: string }[] | null;
  lender_ids?: string[] | null;
}
