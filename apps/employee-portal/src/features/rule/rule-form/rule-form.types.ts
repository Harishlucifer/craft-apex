// Legacy craft-frontend/src/pages/Rule/AddRule.js (RuleDefinition).
// POST /alpha/v1/rule/create     -> { data: { data: { rule_id } } }
// GET  /alpha/v1/rule/?id=X      -> { data: { data: [RuleDetail] } }
// Lookups used by the embedded query builder come from the shared primitive.
//
// Parameters list (drives the field dropdown):
//   GET /alpha/v1/parameter      -> { data: { data: ParameterRow[] } }

import type { FieldOption, GroupCondition } from "@/components/query-builder";

export interface RuleDetail {
  rule_id?: string | number;
  id?: string | number;
  name?: string;
  type?: string;
  status?: number;
  rule?: GroupCondition;
}

export interface RuleSavePayload {
  rule_id?: string | number;
  rule_name: string;
  rule_type: string;
  status: number;
  rule: GroupCondition;
  validation_params: null;
  output_params: null;
}

export interface ParameterRow {
  id: string | number;
  name: string;
  code: string;
  type?: string;
  param_field?: string;
  reference_table?: string;
  reference_column?: string;
  reference_label?: string;
  reference_condition?: string;
}

export function parameterToFieldOption(p: ParameterRow): FieldOption {
  return {
    label: p.name,
    value: p.code,
    type: p.type,
    param_name: p.param_field,
    reference_table: p.reference_table,
    reference_column: p.reference_column,
    reference_label: p.reference_label,
    reference_condition: p.reference_condition,
  };
}
