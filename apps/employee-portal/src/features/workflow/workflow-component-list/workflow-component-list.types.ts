export interface WorkflowComponentRow {
  id: number | string;
  code: string;
  name: string;
  preview_image_url?: string;
  workflow_type: string;
  workflow_step_type: string;
  tags?: string[] | string | null;
  status: number;
  created_at?: string;
  updated_at?: string;
}
