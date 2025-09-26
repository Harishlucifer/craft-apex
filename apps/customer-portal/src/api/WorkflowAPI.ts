// WorkflowAPI.ts
import { useAuthStore } from "@repo/shared-state/stores";
import { useWorkflowStore, Workflow, WorkflowState } from "@/stores/workflow.ts";

/**
 * Optional invalidate callback shape:
 *   (queryKey: unknown[]) => void
 * You can pass e.g. (key) => queryClient.invalidateQueries(key) from a component.
 */
export type InvalidateFn = (queryKey: unknown[]) => void;

export type ExecutionResult = { success: boolean; data: Workflow | null };

export interface WorkflowPayload {
    source_id?: string;
    workflow_instance_id?: string;
    workflow_type: string; // required
    data?: {
        journey_type?: string;
        loan_type?: string;
        application?: {
            type?: string;
            partner_type?: string;
        };
    };
}


export class WorkflowAPI {
    protected apiUrl: string;
    protected user: any;
    protected store: WorkflowState;
    private invalidate?: InvalidateFn;

    /**
     * @param invalidate optional callback to invalidate react-query caches:
     *   new WorkflowAPI((key) => queryClient.invalidateQueries(key))
     */
    constructor(invalidate?: InvalidateFn) {
        this.apiUrl = import.meta.env.VITE_API_ENDPOINT;
        this.user = useAuthStore.getState().user;
        this.store = useWorkflowStore.getState(); // snapshot of store's methods and state
        this.invalidate = invalidate;
    }

    /**
     * Fetch Journey type (POST/journey)
     * return the value and use it directly**/

    async fetchJourneyTypes(workflowType: string, partnerType?: string | null) {
        let url = `${this.apiUrl}/alpha/v1/master/journey-type/group?workflow_type=${workflowType ?? ""}`;
        if (partnerType) {
            url += `&partner_type=${partnerType}`;
        }
        const res = await fetch(url, {
            headers: {
                "X-Platform": "CUSTOMER_PORTAL",
                Authorization: `Bearer ${this.user?.access_token}`,
            },
        });
        if (!res.ok) throw new Error("Failed to fetch journey types");
        return res.json();
    }

    /**
     * Fetch workflow (POST /workflow/build)
     * Stores the received workflow in zustand via setWorkflow.
     */

    async fetchWorkflow(workflowPayload : WorkflowPayload): Promise<Workflow | null> {
        this.store.setWorkflowType(workflowPayload.workflow_type);
        this.store.setLoading(true);

        try {
            const res = await fetch(`${this.apiUrl}/alpha/v1/workflow/build`, {
                method: "POST",
                headers: {
                    "X-Platform": "CUSTOMER_PORTAL",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.user?.access_token}`,
                },
                body: JSON.stringify({...workflowPayload}),
            });

            if (res.status === 204) return null;

            const text = await res.text();
            if (!text) return null;

            const json = JSON.parse(text);
            const workflowData = json.data as Workflow;

            if (workflowData) {
                // Update zustand store so UI reacts
                this.store.setWorkflow(workflowData);
                // optionally invalidate caches
                this.invalidate?.(["workflow",workflowPayload.workflow_type]);
            }

            return workflowData;
        } catch (err) {
            console.error("❌ fetchWorkflow error:", err);
            return null;
        } finally {
            this.store.setLoading(false);
        }
    }

    /**
     * Execute a workflow step on the backend (POST /workflow/execution)
     * Updates the zustand store with returned workflow state if provided.
     * Returns ExecutionResult.success = true if backend responded with 200 or 204.
     */
    async executeWorkflow(step_id: string, id: string, type: string = "LEAD_CREATION"): Promise<ExecutionResult> {
        this.store.setLoading(true);

        try {
            const res = await fetch(`${this.apiUrl}/alpha/v1/workflow/execution`, {
                method: "POST",
                headers: {
                    "X-Platform": "CUSTOMER_PORTAL",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.user?.access_token}`,
                },
                body: JSON.stringify({
                    execute_step_id: step_id,
                    workflow_type: type,
                    source_id: id,
                }),
            });

            // 204 -> nothing to parse, treat as success
            if (res.status === 204) {
                // Mark step as completed locally since server doesn't return updated workflow
                this.store.goToNextStep();
                // Optionally invalidate client cache
                this.invalidate?.(["workflow", id, type]);
                return { success: true, data: null };
            }

            const text = await res.text();
            if (!text) return { success: false, data: null };

            const json = JSON.parse(text);
            const workflowData = json.data as Workflow;

            if (workflowData) {
                // Update store with returned workflow (server is authoritative)
                this.store.setWorkflow(workflowData);
                // trigger cache invalidation if provided
                this.invalidate?.(["workflow", id, type]);
            }

            return { success: res.status === 200, data: workflowData ?? null };
        } catch (err) {
            console.error("❌ executeWorkflow error:", err);
            return { success: false, data: null };
        } finally {
            this.store.setLoading(false);
        }
    }

    /**
     * Base createUpdate - intended to be overridden by child classes (LeadAPI/PartnerAPI).
     */
    async createUpdate(data: any): Promise<any> {
        console.log('createUpdate not implemented in WorkflowAPI',data)
        return {
            source_id: null
        };
    }

    /* Optional helpers exposing store snapshot (useful but not required) */
    get workflow() {
        return this.store.workflow;
    }
}
