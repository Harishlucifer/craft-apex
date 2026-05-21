// Legacy craft-frontend/src/pages/Rule/RuleCategoryNpa/NpaRuleCreateAndUpdate.js
//
// Save pipeline:
//   1. If rule required (with conditions) -> POST /alpha/v1/rule/create
//      -> response.data.data.rule_id
//   2. POST /alpha/v1/rule/category with the rule_category record
//      (rule_id from step 1, default scope=APPLICATION_FLOW, category_type=NPA_RULE)
//   3. If linked lender scheme changed, update both old & new schemes' npa_*_rule_id.
//
// Fetch:
//   GET /alpha/v1/rule/categories?id=X       -> { data: { data: [NpaRuleCategoryDetail] } }
//   GET /alpha/v1/rule/?id=X                 -> { data: { data: [RuleDetail] } }
//   GET /alpha/v1/master/lender/schemes      -> { data: { data: SchemeRow[] } }
//   GET /alpha/v1/master/lender/scheme/:id   -> { data: { data | result: SchemeDetail } }
//   POST /alpha/v1/master/lender/scheme      -> save scheme (echo update)
//   GET /alpha/v1/master/loan-type           -> { data: { data: LoanTypeRow[] } }
//   GET /alpha/v1/parameter                  -> { data: { data: ParameterRow[] } }

import type { GroupCondition } from "@/components/query-builder";
import type { ParameterRow } from "@/features/rule/rule-form/rule-form.types";

export type { ParameterRow };

export const NPA_RULE_TYPES = [
  { value: "NPA_MARKING", label: "NPA Marking" },
  { value: "NPA_PROVISIONING", label: "NPA Provisioning" },
] as const;

export interface NpaRuleCategoryDetail {
  rule_category_id?: string | number;
  id?: string | number;
  name?: string;
  scope?: string;
  category_type?: string;
  journey_type?: string[];
  rule_type?: string;
  loan_type_id?: string | number | null;
  lender_id?: string | number | null;
  lender_scheme_id?: string | number | null;
  rule_id?: string | number | null;
  applicable_to?: string;
  fail_message?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NpaRuleCategorySavePayload {
  rule_category_id?: string | number;
  name: string;
  scope: "APPLICATION_FLOW";
  category_type: "NPA_RULE";
  journey_type: ["FULL_FLEDGED_APPLICATION"];
  rule_type: string;
  loan_type_id: string | number | null;
  lender_id: null;
  employment_type: [];
  lender_scheme_id: null;
  rule_id: string;
  applicable_to: "PRIMARY";
  fail_message: string;
  status: number;
}

export interface RuleSaveForNpaPayload {
  rule_id?: string | number;
  rule_name: string;
  rule_type: "";
  status: number;
  rule: GroupCondition;
  validation_params: null;
  output_params: null;
}

export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LenderSchemeRow {
  lender_scheme_id: string | number;
  name: string;
  npa_marking_rule_id?: string | number;
  npa_provisioning_rule_id?: string | number;
}
