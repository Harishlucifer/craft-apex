// Legacy craft-frontend/src/pages/Rule/RuleList.js
// GET /alpha/v1/rule -> { data: RuleRow[] }

export interface RuleRow {
  id?: string | number | bigint;
  code?: string;
  name?: string;
  rule?: unknown;
  status?: number;
}
