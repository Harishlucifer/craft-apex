// Legacy craft-frontend/src/pages/Workflow/WorkflowAdd.js
// POST /alpha/v1/workflow/create -> save
// GET  /alpha/v1/workflow?id=X   -> body[0]
// GET  /alpha/v1/workflow/component?workflow_step_type=MANUAL|AUTOMATIC|CONDITIONAL
// GET  /alpha/v1/master/field-master?type=COMPONENT
// Lookups: WORKFLOW_TYPE
// Rules:   /alpha/v1/rule

export const WORKFLOW_MODES = [
  { value: "DRAFT", label: "Draft" },
  { value: "TESTING", label: "Testing" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DEACTIVATED", label: "Deactivated" },
] as const;

export const DISPLAY_MODES = [
  { value: "NONE", label: "None" },
  { value: "SUMMARY_ONLY", label: "Summary Only" },
  { value: "UI_BUILDER_ONLY", label: "UI Builder Only" },
  { value: "ALL", label: "All" },
] as const;

export const STEP_TYPES = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "CONDITIONAL", label: "Conditional" },
] as const;

export interface WorkflowStep {
  /** String Date.now()-based temp id for new rows (local editing only —
   * stripped before save, see sanitizeStagesForSave); real backend id
   * (also a string) for existing rows. */
  id?: string | number;
  /** True for a row created in this editing session that hasn't been
   * saved yet — its `id`/`stage_id` are local-only temp values. */
  isNew?: boolean;
  stage_id?: string | number;
  workflow_id?: string | number;
  field_master_id?: string | number | null;
  code?: string;
  name: string;
  description?: string;
  step_type: string;
  display_mode: string;
  ui_component?: string;
  automatic_component?: string;
  conditional_component?: string;
  allocation_rule_id?: string | number;
  validation_rule_id?: string | number;
  completion_rule_id?: string | number;
  configuration?: unknown;
  allocation_configuration?: unknown;
  status: number;
}

export interface WorkflowStage {
  /** String Date.now()-based temp id for new rows (local editing only —
   * stripped before save, see sanitizeStagesForSave); real backend id
   * (also a string) for existing rows. */
  id?: string | number;
  /** True for a row created in this editing session that hasn't been
   * saved yet — its `id` is a local-only temp value. */
  isNew?: boolean;
  sequence?: number;
  name: string;
  description?: string;
  allocation_rule_id?: string | number;
  validation_rule_id?: string | number;
  configuration?: unknown;
  status: number;
  steps: WorkflowStep[];
}

export interface WorkflowDetail {
  id?: string | number;
  name?: string;
  description?: string;
  workflow_type?: string;
  start_date?: string;
  end_date?: string;
  mode?: string;
  is_default?: boolean | number | string;
  status?: number;
  allocation_rule_id?: string | number;
  configuration?: unknown;
  stages?: WorkflowStage[];
}

export interface WorkflowSavePayload {
  id?: string | number;
  name: string;
  description?: string;
  workflow_type: string;
  start_date: string;
  end_date?: string;
  mode: string;
  is_default: number;
  allocation_rule_id?: string | number | null;
  configuration?: unknown;
  status: number;
  stages: WorkflowStage[];
}

export interface RuleRow {
  id: string | number;
  name: string;
  type?: string;
}

export interface ComponentOption {
  /** ID from field-master master. */
  id: string | number;
  /** Display label (the field-master row's `name`). */
  name: string;
  /** Optional nested configuration data (legacy `data`). */
  data?: unknown;
}

export interface WorkflowComponentOption {
  /** Workflow component master row — `name` + `code`. */
  code: string;
  name: string;
}
