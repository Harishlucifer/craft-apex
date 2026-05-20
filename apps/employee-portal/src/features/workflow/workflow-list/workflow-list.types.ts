// Legacy craft-frontend/src/pages/Workflow/Workflow.js
// GET /alpha/v1/workflow -> WorkflowRow[]   (body is the array)

export interface WorkflowRow {
  workflow_id?: string | number;
  name?: string;
  workflow_type?: string;
  start_date?: string;
  end_date?: string;
  status?: number;
}
