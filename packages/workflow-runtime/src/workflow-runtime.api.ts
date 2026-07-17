import { useMutation, useQuery } from "@tanstack/react-query";
import { getApiClient } from "@craft-apex/api";
import type {
  JourneyType,
  WorkflowBuildResponse,
} from "./workflow-runtime.types";

const BUILD_URL = "/alpha/v1/workflow/build";
const EXECUTE_URL = "/alpha/v1/workflow/execution";
const JOURNEY_GROUP_URL = "/alpha/v1/master/journey-type/group";

export interface BuildInput {
  workflowType: string;
  sourceId?: string | number;
  data?: Record<string, unknown>;
}

export async function buildWorkflow(
  input: BuildInput
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
  input: ExecuteInput
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
    queryKey: [
      "journey-type-group",
      workflowType,
      partnerType ?? "",
    ],
    enabled: Boolean(workflowType),
    queryFn: async (): Promise<Record<string, JourneyType[]>> => {
      const qs = partnerType
        ? `?workflow_type=${encodeURIComponent(workflowType)}&partner_type=${encodeURIComponent(partnerType)}`
        : `?workflow_type=${encodeURIComponent(workflowType)}`;
      const body = await getApiClient().get<unknown, any>(`${JOURNEY_GROUP_URL}${qs}`);
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
        `${PARTNER_BASE}/${encodeURIComponent(id!)}`
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
// Other workflow types don't have a verified save endpoint yet — those steps
// will only advance via /alpha/v1/workflow/execution without persisting form data.
const STEP_SAVE_ENDPOINTS: Record<string, string> = {
  PARTNER_ONBOARDING: "/alpha/v1/partner/create",
  BC_ONBOARDING: "/alpha/v1/collection",
  LEAD_CREATION: "/alpha/v1/application/create",
  VERIFICATION: "/alpha/v1/verification/create",
  LENDER_APPLY: "/alpha/v1/application/create",
};

export function hasStepSaveEndpoint(workflowType: string): boolean {
  return workflowType in STEP_SAVE_ENDPOINTS;
}

export interface StepSaveInput {
  workflowType: string;
  /** Raw form payload collected from the structured renderer / textarea. */
  data: Record<string, unknown>;
}

export interface StepSaveResult {
  /** Channel/source id parsed from result.application.channel_id (if present). */
  sourceId?: string | number;
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
  input: StepSaveInput
): Promise<StepSaveResult> {
  const url = STEP_SAVE_ENDPOINTS[input.workflowType];
  if (!url) {
    throw new Error(
      `No save endpoint configured for workflow_type=${input.workflowType}`
    );
  }
  const body = await getApiClient().post<unknown, any>(url, input.data);
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
    result?.id ??
    undefined;
  return { sourceId, raw: body };
}

export function useSaveStepData() {
  return useMutation({ mutationFn: saveStepData });
}
