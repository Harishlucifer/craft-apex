// Legacy craft-frontend/src/pages/Rule/RuleCategoryNpa/NpaRulesList.js
// GET /alpha/v1/rule/categories?category_type=NPA_RULE -> { data: NpaRuleRow[] }

export interface NpaRuleRow {
  rule_category_id?: string | number;
  name?: string;
  fail_message?: string;
  rule_type?: string;
  loan_type_id?: string | number;
  coreLoanTypeList?: { name?: string };
  status?: number;
}
