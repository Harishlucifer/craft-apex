import { useMutation, useQuery } from "@tanstack/react-query";
import { getApiClient } from "@craft-apex/api";
import type {
  JourneyType,
  WorkflowBuildResponse,
} from "./workflow-runtime.types";
import { buildNestedFormPayload } from "./form-builder-options";


const BUILD_URL = "/alpha/v1/workflow/build";
const EXECUTE_URL = "/alpha/v1/workflow/execution";
const JOURNEY_GROUP_URL = "/alpha/v1/master/journey-type/group";

export interface BuildInput {
  workflowType: string;
  sourceId?: string | number;
  data?: Record<string, unknown>;
}

export async function buildWorkflow(
  input: BuildInput,
): Promise<WorkflowBuildResponse | null> {
  const payload: Record<string, unknown> = {
    workflow_type: input.workflowType,
  };
  if (input.sourceId != null) payload.source_id = input.sourceId;
  if (input.data) payload.data = input.data;
  const body = await getApiClient().post<unknown, any>(BUILD_URL, payload);
  const data = body?.data ?? body;
  return (data ?? null) as WorkflowBuildResponse | null;
}

export interface ExecuteInput {
  workflowType: string;
  executeStepId: string | number;
  sourceId: string | number;
  reject?: boolean;
}

export async function executeWorkflow(
  input: ExecuteInput,
): Promise<WorkflowBuildResponse | null> {
  const payload: Record<string, unknown> = {
    workflow_type: input.workflowType,
    execute_step_id: input.executeStepId,
    source_id: input.sourceId,
  };
  if (input.reject) payload.reject = true;
  const body = await getApiClient().post<unknown, any>(EXECUTE_URL, payload);
  const data = body?.data ?? body;
  return (data ?? null) as WorkflowBuildResponse | null;
}

export function useBuildWorkflow() {
  return useMutation({
    mutationFn: buildWorkflow,
  });
}

export function useExecuteWorkflow() {
  return useMutation({
    mutationFn: executeWorkflow,
  });
}

export function useJourneyTypes(workflowType: string, partnerType?: string) {
  return useQuery({
    queryKey: ["journey-type-group", workflowType, partnerType ?? ""],
    enabled: Boolean(workflowType),
    queryFn: async (): Promise<Record<string, JourneyType[]>> => {
      const qs = partnerType
        ? `?workflow_type=${encodeURIComponent(workflowType)}&partner_type=${encodeURIComponent(partnerType)}`
        : `?workflow_type=${encodeURIComponent(workflowType)}`;
      const body = await getApiClient().get<unknown, any>(
        `${JOURNEY_GROUP_URL}${qs}`,
      );
      const data = body?.data ?? body?.result ?? body;
      return (data ?? {}) as Record<string, JourneyType[]>;
    },
  });
}

// ─── Partner CRUD (used by partner onboarding) ─────────────────────────────

const PARTNER_BASE = "/alpha/v1/partner";

export interface PartnerDetail {
  partner_id?: string | number;
  [key: string]: unknown;
}

export function usePartnerDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["partner-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<PartnerDetail | null> => {
      const body = await getApiClient().get<unknown, any>(
        `${PARTNER_BASE}/${encodeURIComponent(id!)}`,
      );
      return (body ?? null) as PartnerDetail | null;
    },
  });
}

export function useSavePartner() {
  return useMutation({
    mutationFn: async (partnerData: PartnerDetail) =>
      getApiClient().post<unknown, any>(`${PARTNER_BASE}/create`, partnerData),
  });
}

// ─── Per-step save (Phase 8.5) ──────────────────────────────────────────────
// Save endpoint by workflow_type. Legacy:
//   PARTNER_ONBOARDING -> POST /alpha/v1/partner/create
//     (Components/redux/partner/partnerThunks.js#createUpdatePartner)
//   BC_ONBOARDING      -> POST /alpha/v1/collection
//     (Components/redux/Collection/CollectionThunk.js#createUpdateCollection)
//   LEAD_CREATION      -> POST /alpha/v1/application/create
//     (Components/redux/application/applicationThunk.js#createUpdateApplication)
//   VERIFICATION       -> POST /alpha/v1/verification/create
//     (Components/redux/Verification/verificationThunk.js#createUpdateVerification)
//   EMPLOYEE_CREATION  -> POST /alpha/v1/employee
//   ROLE_CREATION      -> POST /alpha/v1/master/user-role
//   LOAN_TYPE_CREATION -> POST /alpha/v1/master/loan-type
//   LENDER_CREATION    -> POST /alpha/v1/master/lender
//     (the four settings masters — each form page builds its own payload but
//      saves through this common flow instead of a bespoke useSaveXxx hook)
//   LENDER_PINCODE_UPLOAD -> POST /alpha/v1/master/lender/pincode
//     (bespoke step passes a multipart FormData body as `data`; the api client
//      forwards FormData untouched so the boundary survives)
//   CHECKLIST_MASTER_CREATION -> POST /alpha/v1/master/checklist
//   CAM_CONFIGURATION_CREATION -> POST /alpha/v1/master/cam-configuration
//   LOOKUP_MASTER_CREATION -> POST /alpha/v1/lookup/create
//     (response is `{status, message}` — no result/id at all, see the
//     sourceId comment below)
//   COMMUNICATION_TEMPLATE_CREATION -> POST /alpha/v1/notification/template
//   WORKFLOW_MASTER_CREATION -> POST /alpha/v1/workflow/create
//     (response is `{status, message, data: workflowDetail}` — workflowDetail's
//     `id` is caught by the generic `result?.id` fallback below)
//   WORKFLOW_COMPONENT_CREATION -> POST /alpha/v1/workflow/component
//     (response is `{status, message}` — no result/id at all, same shape as
//     LOOKUP_MASTER_CREATION; the controller bypasses advance() entirely)
//   JOURNEY_TYPE_CREATION -> POST /alpha/v1/master/journey-type
//     (response is `{status, result: journeyType}` — journeyType.id is caught
//     by the generic `result?.id` fallback below)
// Other workflow types don't have a verified save endpoint yet — those steps
// will only advance via /alpha/v1/workflow/execution without persisting form data.
const STEP_SAVE_ENDPOINTS: Record<string, string> = {
  PARTNER_ONBOARDING: "/alpha/v1/partner/create",
  BC_ONBOARDING: "/alpha/v1/collection",
  LEAD_CREATION: "/alpha/v1/application/create",
  VERIFICATION: "/alpha/v1/verification/create",
  EMPLOYEE_CREATION: "/alpha/v1/employee",
  ROLE_CREATION: "/alpha/v1/master/user-role",
  LOAN_TYPE_CREATION: "/alpha/v1/master/loan-type",
  LENDER_CREATION: "/alpha/v1/master/lender",
  TERRITORY_MANAGEMENT: "/alpha/v1/master/territory",
  LENDER_PINCODE_UPLOAD: "/alpha/v1/master/lender/pincode",
  CHECKLIST_MASTER_CREATION: "/alpha/v1/master/checklist",
  CAM_CONFIGURATION_CREATION: "/alpha/v1/master/cam-configuration",
  LOOKUP_MASTER_CREATION: "/alpha/v1/lookup/create",
  COMMUNICATION_TEMPLATE_CREATION: "/alpha/v1/notification/template",
  WORKFLOW_MASTER_CREATION: "/alpha/v1/workflow/create",
  WORKFLOW_COMPONENT_CREATION: "/alpha/v1/workflow/component",
  JOURNEY_TYPE_CREATION: "/alpha/v1/master/journey-type",
};

export function hasStepSaveEndpoint(workflowType: string): boolean {
  return workflowType in STEP_SAVE_ENDPOINTS;
}

export interface StepSaveInput {
  workflowType: string;
  /**
   * The request body to POST. Either the raw form payload collected from the
   * structured renderer / textarea (a flat `Record`), or a fully-typed save
   * payload a page built itself (e.g. the settings masters) — hence `object`
   * rather than `Record<string, unknown>`, so typed interfaces are accepted.
   */
  data: object;
}

export interface StepSaveResult {
  /** Channel/source id parsed from result.application.channel_id (if present). */
  sourceId?: string | number;
  /** Unwrapped result envelope (body.result ?? body.data.result ?? …) — the
   *  saved entity, for steps that need the whole record back (e.g. Role). */
  result: any;
  /** Raw server response — handy for downstream extraction. */
  raw: any;
}

/**
 * POST the step form data to the workflow's save endpoint. Returns the new
 * source_id when the backend issues one (initial create flow).
 *
 * Legacy `PartnerFlowWithDynamic.moveForward` does additional merging
 * (utm_tags, relationship_managers, application.email/mobile filter). We
 * forward the form data verbatim — the structured form schema controls what
 * gets included.
 */
export async function saveStepData(
  input: StepSaveInput,
): Promise<StepSaveResult> {
  const url = STEP_SAVE_ENDPOINTS[input.workflowType];
  if (!url) {
    throw new Error(
      `No save endpoint configured for workflow_type=${input.workflowType}`,
    );
  }
  console.log("[saveStepData] Raw Step Data:", input.data);
  const nestedPayload = buildNestedFormPayload(
    input.data as Record<string, unknown>,
  );
  console.log("[saveStepData] Nested Payload to POST:", nestedPayload);
  const body = await getApiClient().post<unknown, any>(url, nestedPayload);

  if (body && body.status != null && body.status < 1) {
    const message = body.message ?? "Save failed";
    throw new Error(String(message));
  }
  const result = body?.result ?? body?.data?.result ?? body?.data ?? body;
  // LEAD_CREATION lands a fresh id at `result.application.application_id`
  // (legacy `EnquiryCustomerLeadsFollowUp.js:196` navigates to that id).
  // PARTNER_ONBOARDING uses `result.application.channel_id`.
  // VERIFICATION uses `result.verification_id` at the top level
  // (legacy `VerificationFlow.js:698-701` navigates to that id).
  const sourceId =
    result?.application?.application_id ??
    result?.application?.channel_id ??
    result?.verification_id ??
    result?.channel_id ??
    // Settings masters: employee/role/loan-type/lender each land a fresh id on
    // create at their own `*_id` field (employee also nests it under `user`).
    result?.employee_id ??
    result?.user?.employee_id ??
    result?.user_role_id ??
    // CHECKLIST_MASTER_CREATION must be checked before loan_type_id/lender_id:
    // ChecklistParams (alpha-api app/handler/master/checklist.go) carries BOTH
    // its own `checklist_id` AND a `lender_id`/`loan_type` the checklist merely
    // references — checking the generic loan_type_id/lender_id fields first
    // would wrongly resolve sourceId to that referenced entity's id instead of
    // the checklist's own, breaking the id handoff into step 2+.
    result?.checklist_id ??
    // CAM_CONFIGURATION_CREATION must likewise be checked before loan_type_id/
    // rule_id: CamConfigurationParamList (alpha-api app/handler/master/cam.go)
    // carries its own `configuration_id` alongside a referenced `loan_type_id`/
    // `rule_id`/`template_id` — same collision class as checklist_id above.
    result?.configuration_id ??
    result?.loan_type_id ??
    result?.lender_id ??
    result?.id ??
    undefined;
  return { sourceId, result, raw: body };
}

export function useSaveStepData() {
  return useMutation({ mutationFn: saveStepData });
}
