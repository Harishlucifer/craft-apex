import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useWorkflowComponentDetail } from "./workflow-component-form.api";
import type { WorkflowComponentSavePayload } from "./workflow-component-form.types";
import {
  buildNestedFormPayload,
  saveStepData,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Workflow Component create/edit — a single-FORM_BUILDER-step master (no
 * stepper), same shape as lookup-master-form.page.tsx. POST
 * /alpha/v1/workflow/component's response is `{status, message}` — no id at
 * all, so the generic advance()/executeWorkflow chain (which requires a
 * resolved source id to call /alpha/v1/workflow/execution) can never succeed
 * here even though the save itself did. Bypass advance() entirely and call
 * the save directly, same as Lookup Master.
 */
export const workflowComponentMaster: MasterWorkflowPageProps = {
  noun: "Workflow Component",
  workflowType: WorkflowType.WorkflowComponentCreation,
  listPath: "/settings/workflow/component",
  maxWidth: "max-w-3xl",
  emptyLabel: "workflow component creation",
  useController: useWorkflowComponentController,
};

function useWorkflowComponentController({
  id,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useWorkflowComponentDetail(id);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      workflow_type: detail?.workflow_type ?? "",
      workflow_step_type: detail?.workflow_step_type ?? "",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(
      formValues,
    ) as Partial<WorkflowComponentSavePayload>;

    const payload: WorkflowComponentSavePayload = {
      ...(id ? { id } : {}),
      code: String(nested.code ?? ""),
      name: String(nested.name ?? ""),
      workflow_type: String(nested.workflow_type ?? ""),
      workflow_step_type: String(nested.workflow_step_type ?? ""),
      status: Number(nested.status ?? 1),
    };

    setSaving(true);
    try {
      await saveStepData({
        workflowType: WorkflowType.WorkflowComponentCreation,
        data: payload,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      return;
    } finally {
      setSaving(false);
    }
    toast.success(`Workflow component ${id ? "updated" : "saved"} successfully`);
    navigate("/settings/workflow/component");
  };

  const stepContext: FormBuilderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save" : "Create",
    cancelHref: "/settings/workflow/component",
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    singleStep: true,
  };
}
