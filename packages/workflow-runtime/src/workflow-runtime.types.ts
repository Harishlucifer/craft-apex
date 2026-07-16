// Workflow runtime — executes workflows defined in /settings/workflow.
//
// Legacy:
//   craft-frontend/src/Components/PartnerOnboarding/PartnerFlowWithDynamic.js
//   craft-frontend/src/Components/redux/Workflow/{workflowThunk,workflowSlice}.js
//
// API contracts:
//   POST /alpha/v1/workflow/build       -> load workflow for a (type, source)
//   POST /alpha/v1/workflow/execution   -> advance to the next step (or reject)
//   GET  /alpha/v1/master/journey-type/group?workflow_type=…&partner_type=…
//                                      -> journey type catalog
//   GET  /alpha/v1/partner/{id}         -> partner record
//   POST /alpha/v1/partner/create       -> partner save

export const WorkflowType = {
  PartnerOnboarding: "PARTNER_ONBOARDING",
  Verification: "VERIFICATION",
  LenderApply: "LENDER_APPLY",
  Campaign: "CAMPAIGN",
  BcPartnerOnboarding: "BC_PARTNER_ONBOARDING",
  LeadCreation: "LEAD_CREATION",
  CarBuyingJourney: "CAR_BUYING_JOURNEY",
  /**
   * Drives the Employee create/edit step list (see employee-form.page.tsx).
   * Must match the workflow_type configured server-side via /settings/workflow.
   */
  EmployeeCreation: "EMPLOYEE_CREATION",
  /**
   * Drives the Role create/edit step list (see role-form.page.tsx).
   * Must match the workflow_type configured server-side via /settings/workflow.
   */
  RoleCreation: "ROLE_CREATION",
  /**
   * Drives the Loan Type create/edit step list (see loan-type-form.page.tsx).
   * Must match the workflow_type configured server-side via /settings/workflow.
   */
  LoanTypeCreation: "LOAN_TYPE_CREATION",
} as const;

export type WorkflowTypeValue =
  (typeof WorkflowType)[keyof typeof WorkflowType];

export const StepType = {
  Manual: "MANUAL",
  Automatic: "AUTOMATIC",
  Conditional: "CONDITIONAL",
} as const;

export interface WorkflowStepDef {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
  step_type: string;
  display_mode?: string;
  ui_component?: string;
  automatic_component?: string;
  conditional_component?: string;
  field_master_id?: string | number | null;
  configuration?: unknown;
  status?: number;
  /** Server-collected step output (legacy `data`). */
  data?: unknown;
}

export interface WorkflowStageDef {
  id: string | number;
  name: string;
  description?: string;
  sequence?: number;
  status?: number;
  configuration?: unknown;
  steps: WorkflowStepDef[];
}

export interface WorkflowBuildResponse {
  workflow_id?: string | number;
  workflow_type?: string;
  source_id?: string | number;
  mode?: string;
  status?: number;
  last_active_stage_id?: string | number;
  last_active_step_id?: string | number;
  /** `null` when no workflow is configured yet for this (type, source). */
  stages: WorkflowStageDef[] | null;
  /** Loose typing for the source object the workflow walks over. */
  source?: unknown;
}

export interface JourneyType {
  code: string;
  name?: string;
  description?: string;
  partner_type?: string;
}

export interface JourneyTypeGroup {
  [groupKey: string]: JourneyType[];
}
