// Legacy file:
//   craft-frontend/src/pages/Configuration/Employee/DynamicEmployeeAllocation.js (860 LOC)
//
// Step 4 of the employee create/edit stepper. Manages allocation rules
// (workflow type + participant + eligibility / priority rule references).
//
// Endpoints (verbatim from legacy ApiEndPoint.js):
//   GET  /alpha/v1/employee/{id}                     -> result.user_allocation[]
//   GET  /alpha/v1/rule                              -> data.data[] (id, name)
//   GET  /alpha/v1/rule?id={ruleId}                  -> data.data[0]
//   GET  /alpha/v1/lookup?group_code=WORKFLOW_TYPE,{participantGroup}
//   GET  /alpha/v1/parameter                         -> data.data[]
//   POST /alpha/v1/rule/create                       -> data.data.rule_id
//
// Legacy `GetCall` returns the body directly; `PostCall` likewise.

export type AllocationStatus = 1 | -1;

export interface EmployeeAllocationRow {
  workflow_type: string;
  role_code?: string;
  participant_type: string;
  eligibility_rule_id: string | number | null;
  priority_rule_id: string | number | null;
  status: number;
}

export interface RuleCondition {
  operator: string;
  output: Record<string, unknown>;
  conditions: RuleCondition[] | unknown[];
}

export interface RuleParameters {
  operator: string;
  output: Record<string, unknown>;
  conditions: RuleCondition[] | unknown[];
}

export interface LookupRow {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface RuleListRow {
  id: string | number;
  name: string;
  rule?: RuleParameters;
}

export interface RuleCreatePayload {
  rule_id: string | number | "";
  rule_name: string;
  rule_type: "PRIORITY" | "ELIGIBILITY";
  status: number;
  rule: RuleParameters;
  validation_params: null;
  output_params: null;
}

export interface RuleCreateResponse {
  data?: { data?: { rule_id?: string | number } };
}

export interface ParameterRow {
  name: string;
  code: string;
  type: string;
  param_field?: string;
  reference_table?: string;
  reference_column?: string;
  reference_condition?: string;
  reference_label?: string;
}
