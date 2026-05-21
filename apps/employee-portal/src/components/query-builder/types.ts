// Query builder primitives — ported from
// craft-frontend/src/Components/Common/QueryBuilder/*
//
// A Rule's `rule` JSON has a recursive shape:
//
//   {
//     operator: 'AND' | 'OR',
//     output?: Record<string, string>,
//     conditions: Array< Leaf | Group >,
//   }
//
// Leaf = field + operator + value/values (+ param_name display label).
// Group = nested rule with its own operator + conditions[].

export interface LeafCondition {
  field: string;
  operator: string;
  value?: string;
  values?: string[];
  param_name?: string;
}

export interface GroupCondition {
  operator: string;
  output?: Record<string, string>;
  conditions: Array<LeafCondition | GroupCondition>;
}

export type AnyCondition = LeafCondition | GroupCondition;

export function isLeaf(c: AnyCondition): c is LeafCondition {
  return (c as LeafCondition).field !== undefined;
}

/**
 * Field option used by both the field-name dropdown and the value cascade.
 * `type === "REFERENCE_MASTER"` triggers a server-side reference-table fetch
 * to populate the value dropdown.
 */
export interface FieldOption {
  label: string;
  value: string;
  type?: string;
  param_name?: string;
  reference_table?: string;
  reference_column?: string;
  reference_label?: string;
  reference_condition?: string;
}

// Arithmetic builder shape (legacy RuleArithmetic / ArithmeticQueryCondition).
//
// Group:
//   { operator: '+'|'-'|'*'|'/'|'min'|'max', conditions: Array<ArithmeticAny> }
// Leaf:
//   { field_type: 'Parameter'|'Value', field?: string, value?: string }
export interface ArithmeticLeaf {
  field_type?: "Parameter" | "Value" | "";
  field?: string;
  value?: string;
}

export interface ArithmeticGroup {
  operator: string;
  conditions: Array<ArithmeticLeaf | ArithmeticGroup>;
}

export type ArithmeticAny = ArithmeticLeaf | ArithmeticGroup;

export function isArithmeticLeaf(c: ArithmeticAny): c is ArithmeticLeaf {
  return (c as ArithmeticGroup).conditions === undefined;
}
