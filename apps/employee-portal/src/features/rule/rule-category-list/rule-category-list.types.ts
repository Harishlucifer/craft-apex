// Legacy craft-frontend/src/pages/Rule/Rule Category/List.js
// GET /alpha/v1/rule/categories -> { data: RuleCategoryRow[] }

export interface RuleCategoryRow {
  rule_category_id?: string | number;
  name?: string;
  scope?: string;
  category_type?: string;
  rule_type?: string;
  loan_type?: { loan_type_name?: string } | string;
  journey_type?: string;
  lender?: { lender_name?: string } | string;
}
