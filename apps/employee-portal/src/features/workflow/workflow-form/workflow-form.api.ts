import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ComponentOption,
  RuleRow,
  WorkflowComponentOption,
  WorkflowDetail,
} from "./workflow-form.types";

// The Workflow Type dropdown in the FORM_BUILDER header step resolves
// against /alpha/v1/lookup?group_code=WORKFLOW_TYPE via the server-configured
// form_builder JSON's `source.api` — no bespoke hook needed here anymore.
// The save itself now goes through the workflow-runtime's saveStepData (see
// WORKFLOW_MASTER_CREATION in workflow-runtime.api.ts) rather than a bespoke
// useSaveWorkflow mutation.
const WORKFLOW_URL = "/alpha/v1/workflow";
const WORKFLOW_COMPONENT_URL = "/alpha/v1/workflow/component";
const FIELD_MASTER_URL = "/alpha/v1/master/field-master?type=COMPONENT";
const RULE_URL = "/alpha/v1/rule";

export function useWorkflowRules() {
  return useQuery({
    queryKey: ["rule-list-for-workflow"],
    queryFn: async (): Promise<RuleRow[]> => {
      const body = await api.get<unknown, any>(RULE_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as RuleRow[]) : [];
    },
  });
}

export function useFieldMasterComponents() {
  return useQuery({
    queryKey: ["field-master-components"],
    queryFn: async (): Promise<ComponentOption[]> => {
      const body = await api.get<unknown, any>(FIELD_MASTER_URL);
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as ComponentOption[]) : [];
    },
  });
}

export function useWorkflowComponents(stepType: string | undefined) {
  return useQuery({
    queryKey: ["workflow-components", stepType ?? ""],
    enabled: Boolean(stepType),
    queryFn: async (): Promise<WorkflowComponentOption[]> => {
      const body = await api.get<unknown, any>(
        `${WORKFLOW_COMPONENT_URL}?workflow_step_type=${encodeURIComponent(stepType!)}`
      );
      const arr = body?.data ?? body?.result ?? body;
      return Array.isArray(arr) ? (arr as WorkflowComponentOption[]) : [];
    },
  });
}

export function useWorkflowDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["workflow-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<WorkflowDetail | null> => {
      const body = await api.get<unknown, any>(
        `${WORKFLOW_URL}?id=${encodeURIComponent(id!)}`
      );
      // Legacy body is the array directly.
      const arr = Array.isArray(body)
        ? body
        : (body?.data ?? body?.result ?? []);
      const first = Array.isArray(arr) ? (arr[0] as WorkflowDetail) : null;
      return first ?? null;
    },
  });
}
