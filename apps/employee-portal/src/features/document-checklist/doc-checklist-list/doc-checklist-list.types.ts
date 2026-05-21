// Legacy craft-frontend/src/pages/DocumentChecklist/DocChecklist.js
// GET /alpha/v1/master/checklist -> { result: ChecklistRow[] }

export interface ChecklistRow {
  checklist_id?: string | number;
  rule_id?: string | number;
  title?: string;
  type?: string;
  loan_type?: { loan_type_name?: string };
  applicable_to?: string;
  status?: number;
}
