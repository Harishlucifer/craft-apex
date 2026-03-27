import { BaseApiService } from "./base";
import { useWorkflowStore } from "../store/workflowStore";
import type {
  Workflow,
  WorkflowState,
  WorkflowPayload,
  ExecutionResult,
  InvalidateFn,
} from "../types";

/**
 * WorkflowAPI — class-based API service for workflow operations.
 *
 * Follows the same singleton + inheritance pattern used in
 * `Lead/api/WorkflowAPI.ts`:
 *   - `fetchJourneyTypes()`  — retrieves available journey types
 *   - `fetchWorkflow()`      — builds/loads a workflow from the server
 *   - `executeWorkflow()`    — marks a step as executed on the backend
 *   - `createUpdate()`       — base hook for child classes to override
 *
 * Child classes (e.g. `LeadAPI`) can extend this and override `createUpdate`
 * to integrate domain-specific create/update logic.
 */
export class WorkflowAPI extends BaseApiService {
  private static workflowInstance: WorkflowAPI;
  protected invalidate?: InvalidateFn;

  protected constructor(invalidate?: InvalidateFn) {
    super();
    this.invalidate = invalidate;
  }

  protected get store(): WorkflowState {
    return useWorkflowStore.getState();
  }

  public static getInstance(invalidate?: InvalidateFn): WorkflowAPI {
    if (!WorkflowAPI.workflowInstance) {
      WorkflowAPI.workflowInstance = new WorkflowAPI(invalidate);
    }
    return WorkflowAPI.workflowInstance;
  }

  // ── Journey Types ────────────────────────────────────────────────────────

  /**
   * Fetch grouped journey types for a given workflow type.
   * Optionally filter by partner type.
   */
  async fetchJourneyTypes(
    workflowType: string,
    partnerType?: string | null
  ) {
    let endpoint = `/alpha/v1/master/journey-type/group?workflow_type=${workflowType ?? ""}`;
    if (partnerType) {
      endpoint += `&partner_type=${partnerType}`;
    }
    const apiResponse = await this.get(endpoint);
    return apiResponse.data;
  }

  // ── Fetch / Build Workflow ───────────────────────────────────────────────

  /**
   * POST /workflow/build — fetches (or creates) a workflow for the given
   * source / journey combination and stores it in Zustand.
   */
  async fetchWorkflow(payload: WorkflowPayload): Promise<Workflow | null> {
    this.store.setWorkflowType(payload.workflow_type);
    this.store.setLoading(true);

    try {
      const apiResponse = await this.post(
        "/alpha/v1/workflow/build",
        payload
      );
      if (apiResponse.status === 204) return null;

      const workflowData = apiResponse.data as Workflow;
      if (workflowData) {
        this.store.setWorkflow(workflowData);
        this.invalidate?.(["workflow", payload.workflow_type]);
      }
      return workflowData;
    } catch (err) {
      console.error("❌ fetchWorkflow error:", err);
      return null;
    } finally {
      this.store.setLoading(false);
    }
  }

  // ── Execute Workflow Step ────────────────────────────────────────────────

  /**
   * POST /workflow/execution — executes a single step.
   * On 204 the store advances locally; on 200 the server-returned workflow
   * becomes the source of truth.
   */
  async executeWorkflow(
    stepId: string,
    sourceId: string,
    type: string = "LEAD_CREATION"
  ): Promise<ExecutionResult> {
    this.store.setLoading(true);

    try {
      const payload = {
        execute_step_id: stepId,
        workflow_type: type,
        source_id: sourceId,
      };

      const apiResponse = await this.post(
        "/alpha/v1/workflow/execution",
        payload
      );

      if (apiResponse.status === 204) {
        this.store.goToNextStep();
        this.invalidate?.(["workflow", sourceId, type]);
        return { success: true, data: null };
      }

      const workflowData = apiResponse.data as Workflow;
      if (workflowData) {
        this.store.setWorkflow(workflowData);
        this.invalidate?.(["workflow", sourceId, type]);
      }

      return {
        success: apiResponse.status === 200,
        data: workflowData ?? null,
      };
    } catch (err) {
      console.error("❌ executeWorkflow error:", err);
      return { success: false, data: null };
    } finally {
      this.store.setLoading(false);
    }
  }

  // ── Create / Update (Override Hook) ──────────────────────────────────────

  /**
   * Base implementation — intended to be overridden by child classes
   * (LeadAPI, PartnerAPI, etc.) that know how to create/update
   * domain-specific records.
   */
  async createUpdate(data: any, version?: string): Promise<any> {
    console.log("createUpdate not implemented in WorkflowAPI", data, version);
    return { source_id: null };
  }

  // ── Convenience Getters ──────────────────────────────────────────────────

  get workflow() {
    return this.store.workflow;
  }
}
