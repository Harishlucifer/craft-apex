import { z } from "zod";

export interface UnderwritingMatrixSavePayload {
  underwriting_matrix_id?: string;
  workflow_type: string;
  rule_id: string;
  approver_level: string;
  priority_order: number;
  reviewer_levels: string[];
  status: number;
}

export const underwritingMatrixSchema = z.object({
  workflow_type: z.string().min(1, "Workflow Type is required"),
  approver_level: z.string().min(1, "Approve Level is required"),
  reviewer_levels: z.array(z.string()).min(1, "At least one reviewer level is required"),
  priority_order: z.coerce.number().int().min(1, "Priority Order must be a positive integer"),
  status: z.coerce.number().int(),
  rule_id: z.string().optional().nullable(),
});

export type UnderwritingMatrixFormValues = z.infer<typeof underwritingMatrixSchema>;
