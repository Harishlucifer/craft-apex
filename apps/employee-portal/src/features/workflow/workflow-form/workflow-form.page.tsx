import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import {
  useFieldMasterComponents,
  useWorkflowDetail,
  useWorkflowRules,
} from "./workflow-form.api";
import type { WorkflowSavePayload, WorkflowStage } from "./workflow-form.types";
import type { WorkflowStepContext } from "./workflow-form.steps";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Workflow (Settings → Workflow) create/edit. Driven by the generic
 * MasterWorkflowPage — a FORM_BUILDER header step (name/type/dates/mode/
 * allocation rule/config JSON/status; the Workflow Type dropdown resolves
 * via the server-configured form_builder JSON's `source.api`, same as every
 * other converted master) followed by a bespoke WORKFLOW_STAGES step that
 * reuses the original StageModal/StepModal CRUD (see workflow-stages-panel.tsx)
 * unchanged. `mode` PUBLISHED/DEACTIVATED locks header fields via each
 * field's own `disabledOn: {field: "mode", ...}` in the form_builder JSON —
 * the Stages step additionally receives `isLocked` since its bespoke UI
 * isn't declaratively driven by form_builder validation.
 */
export const workflowMaster: MasterWorkflowPageProps = {
  noun: "Workflow",
  workflowType: WorkflowType.WorkflowMasterCreation,
  listPath: "/settings/workflow",
  maxWidth: "max-w-7xl",
  emptyLabel: "workflow creation",
  useController: useWorkflowController,
};

/**
 * Stage/step `id`s for rows added in this editing session are local-only
 * temp values (see stage-modal.tsx / step-modal.tsx) used to track/reorder
 * them before they're saved — the backend expects `id` to be its own
 * string, or absent entirely so it can assign one. Strip `id` for any
 * `isNew` row, and `stage_id` for any new step (it would just be pointing at
 * its stage's own temp id) — the step's placement is already conveyed by
 * nesting it under its stage in this payload.
 */
function sanitizeStagesForSave(stages: WorkflowStage[]): WorkflowStage[] {
  return stages.map((stage) => {
    const { isNew: _stageIsNew, id: stageId, ...restStage } = stage;
    return {
      ...restStage,
      ...(stage.isNew ? {} : { id: stageId }),
      steps: stage.steps.map((step) => {
        const { isNew: _stepIsNew, id: stepId, stage_id, ...restStep } = step;
        return {
          ...restStep,
          ...(step.isNew ? {} : { id: stepId, stage_id }),
        };
      }),
    };
  });
}

function useWorkflowController({
  id,
  advance,
  saving,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: rules = [] } = useWorkflowRules();
  const { data: fieldComponents = [] } = useFieldMasterComponents();
  const { data: detail } = useWorkflowDetail(id);

  const [stages, setStages] = useState<WorkflowStage[]>([]);
  useEffect(() => {
    setStages(Array.isArray(detail?.stages) ? detail!.stages! : []);
  }, [detail?.stages]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setFormValues({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      workflow_type: detail?.workflow_type ?? "",
      start_date: detail?.start_date ? detail.start_date.split("T")[0] : "",
      end_date: detail?.end_date ? detail.end_date.split("T")[0] : "",
      mode: detail?.mode ?? "DRAFT",
      is_default: detail?.is_default != null ? Number(detail.is_default) : 0,
      allocation_rule_id:
        detail?.allocation_rule_id != null
          ? String(detail.allocation_rule_id)
          : "",
      configuration:
        detail?.configuration != null
          ? JSON.stringify(detail.configuration)
          : "{}",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const isLocked =
    formValues.mode === "PUBLISHED" || formValues.mode === "DEACTIVATED";

  const submitFormBuilderStep = async () => {
    const { configuration: rawConfiguration, ...rest } = formValues;
    let configuration: unknown = {};
    if (typeof rawConfiguration === "string" && rawConfiguration.trim()) {
      try {
        configuration = JSON.parse(rawConfiguration);
      } catch {
        toast.error("Configuration must be valid JSON");
        return;
      }
    }

    const nested = buildNestedFormPayload(rest) as Partial<WorkflowSavePayload>;
    const payload: WorkflowSavePayload = {
      ...(id ? { id } : {}),
      name: String(nested.name ?? ""),
      description: nested.description ? String(nested.description) : undefined,
      workflow_type: String(nested.workflow_type ?? ""),
      start_date: String(nested.start_date ?? ""),
      end_date: nested.end_date ? String(nested.end_date) : undefined,
      mode: String(nested.mode ?? "DRAFT"),
      is_default: Number(nested.is_default ?? 0),
      allocation_rule_id: nested.allocation_rule_id
        ? String(nested.allocation_rule_id)
        : null,
      configuration,
      status: Number(nested.status ?? 1),
      stages: sanitizeStagesForSave(stages),
    };

    const res = await advance(payload);
    if (!res) return;
    toast.success(`Workflow ${id ? "updated" : "created"} successfully`);
    if (!id && res.sourceId) {
      setSavedId(String(res.sourceId));
      navigate(`/settings/workflow/create/${String(res.sourceId)}`, {
        replace: true,
      });
    }
  };

  const submitStagesStep = async () => {
    if (!detail && !id) return;
    const payload: WorkflowSavePayload = {
      ...(id ? { id } : {}),
      name: detail?.name ?? "",
      description: detail?.description,
      workflow_type: detail?.workflow_type ?? "",
      start_date: detail?.start_date ? detail.start_date.split("T")[0]! : "",
      end_date: detail?.end_date ? detail.end_date.split("T")[0] : undefined,
      mode: detail?.mode ?? "DRAFT",
      is_default: Number(detail?.is_default ?? 0),
      allocation_rule_id: detail?.allocation_rule_id ?? null,
      configuration: detail?.configuration ?? {},
      status: Number(detail?.status ?? 1),
      stages: sanitizeStagesForSave(stages),
    };
    const res = await advance(payload);
    if (!res) return;
    toast.success("Workflow saved successfully");
    navigate("/settings/workflow");
  };

  const stepContext: FormBuilderStepContext & WorkflowStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    cancelHref: "/settings/workflow",
    rules,
    fieldComponents,
    stages,
    onStagesChange: setStages,
    isLocked,
    onSave: submitStagesStep,
    saving,
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(id),
  };
}
