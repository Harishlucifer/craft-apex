// Legacy craft-frontend/src/pages/Workflow/WorkflowComponent (see the
// previous workflow-component-modal.tsx this replaces).
// POST /alpha/v1/workflow/component
//   body = { id?, code, name, workflow_type, workflow_step_type, status }
// Response is `{status, message}` — no id at all, same shape as
// LOOKUP_MASTER_CREATION (see workflow-component-form.page.tsx).

export interface WorkflowComponentSavePayload {
  id?: string | number;
  code: string;
  name: string;
  workflow_type: string;
  workflow_step_type: string;
  status: number;
}

/** GET /alpha/v1/workflow/component has no `id` filter — the edit-mode
 * detail hook fetches the full list and finds the row client-side (the
 * same data the old modal received directly from the list page). */
export interface WorkflowComponentDetail {
  id: number | string;
  code: string;
  name: string;
  workflow_type: string;
  workflow_step_type: string;
  status: number;
}
