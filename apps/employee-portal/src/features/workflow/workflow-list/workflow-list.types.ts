// Legacy craft-frontend/src/pages/Workflow/Workflow.js
// GET /alpha/v1/workflow -> WorkflowRow[]   (body is the array)

export interface WorkflowRow {
  /** Backend returns `id`; older `workflow_id` retained for safety. */
  id?: string | number;
  workflow_id?: string | number;
  name?: string;
  workflow_type?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
  status?: number;
}
