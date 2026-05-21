// Legacy craft-frontend/src/pages/TargetMgmt/{AddPlan,TargetPlanFields}.js
// POST /alpha/v1/master/target-plan          -> saves the plan (step-1 save)
// GET  /alpha/v1/master/target-plan?targetPlanId=ID -> { data: [TargetPlanDetail] }
// Lookups: USER_TYPE, PARTNER_CATEGORY (group_codes)
// Territory:      GET /alpha/v1/master/territory       -> { data: TerritoryRow[] }
// Territory Type: GET /alpha/v1/master/territory-type  -> { data: TerritoryTypeRow[] }
// Employee Role:  GET /alpha/v1/master/user-role       -> { data: EmployeeRole[] }
//
// Legacy userTypeValue: { partner, channel, employee, vendor, territory, customer }

export const TARGET_LEVEL = {
  PARTNER: "PARTNER",
  CHANNEL: "CHANNEL",
  EMPLOYEE: "EMPLOYEE",
  VENDOR: "VENDOR",
  TERRITORY: "TERRITORY",
  CUSTOMER: "CUSTOMER",
} as const;

export interface TargetSchemeRow {
  target_scheme_id?: string | number;
  loan_type_id?: string | number | null;
  lender_id?: string | number | null;
  target_type?: string;
  target_sub_type?: string;
  target_period?: string;
  target_attribute?: string;
  target_value?: string | number;
  status?: number;
}

export interface TargetPlanDetail {
  target_plan_id?: string | number;
  title?: string;
  description?: string;
  target_level?: string;
  territory_id?: string | number | null;
  partner_category?: string;
  user_role?: string | number;
  target_period?: string;
  start_period?: string;
  end_period?: string;
  status?: number;
  target_schemes?: TargetSchemeRow[];
}

export interface TargetPlanSavePayload {
  target_plan_id?: string | number;
  title?: string;
  description?: string;
  target_level?: string;
  territory_id?: string | number | null;
  partner_category?: string;
  user_role?: string;
  target_period?: string;
  start_period?: string;
  end_period?: string;
  status?: number;
  target_schemes?: TargetSchemeRow[];
}

export interface LoanTypeOption {
  id: string | number;
  name: string;
}

export interface LenderOption {
  lender_id: string | number;
  name: string;
}

// Legacy targetAttributesWithSubTypes mapping (constant.js).
export const TARGET_ATTRIBUTE_SUB_TYPE: Record<string, string> = {
  CREATE_COUNT: "COUNT",
  COLD_CALL_COUNT: "COUNT",
  FILE_LOGIN_COUNT: "COUNT",
  DISBURSED_AMOUNT: "AMOUNT",
  SANCTIONED_AMOUNT: "AMOUNT",
  REQUEST_AMOUNT: "AMOUNT",
};

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface TerritoryRow {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}

export interface TerritoryTypeRow {
  territory_type_id: string | number;
  territory_type_name: string;
}

export interface EmployeeRoleRow {
  id: string | number;
  name: string;
}
