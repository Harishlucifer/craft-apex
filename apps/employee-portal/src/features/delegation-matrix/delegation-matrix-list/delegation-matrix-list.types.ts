export interface UnderwritingMatrixRow {
  underwriting_matrix_id: string;
  workflow_type: string;
  rule_id?: string | null;
  approver_level: string;
  priority_order: number;
  reviewer_levels: string[];
  status: number;
  created_at?: string;
  updated_at?: string;
}
